import React, { Suspense, lazy, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { StatePanel } from '@dx/continuum-state-panel'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { invChiSquareCDF } from 'inv-chisquare-cdf'

import { useFetchArchiveData } from '../../../hooks/fetchData'
import { 
  KPI_NAMES,
  CDF_TABLE,
  ARCHIVE_REPORTING_LOGS,
  TTFF_KPI_MAPPING,
  FITNESS_FEATURES,
  NMEA
} from '../../../utilities/constants'
import { 
  createArchiveLabels,
  isValidArchiveData,
  size,
  filterArchiveData,
  getIndices,
  isEmpty
} from '../../../utilities/helpers'

const CdfPlot = lazy(() => import('./CdfPlot'))

const _ = require('underscore')


const ErrorMessage = () => (
  <div className="cdf-error">
    <StatePanel
      message="Error- could not find CDF data."
      suggestion="Data may still be processing."
    />
  </div>
)

const getKpis = (technology, feature, archivesInfo, cdfTableInfo, filters, reportType='') => {
  if ('kpis' in filters && reportType !== 'NMEA') return filters.kpis
  if (technology === 'GNSS' && feature === 'TTFF' && reportType !== 'NMEA') {
    const { customFilters } = filters
    const { source, table_name } = customFilters
    return Object.keys(TTFF_KPI_MAPPING[source][table_name])
  }
  const { kpiColumn } = cdfTableInfo
  let kpis = []
  Object.values(archivesInfo).forEach((archiveData) => {
    const archiveKpis = archiveData[kpiColumn]
    kpis = _.uniq(kpis.concat(archiveKpis)).filter(kpi => kpi)
  })
  return kpis
}

const getCdfTable = (technology, feature, reportType='') => {
  switch (true) {
    case technology === 'GNSS' && FITNESS_FEATURES.includes(feature) && reportType === '':
      const cdfInfo = JSON.parse(JSON.stringify(CDF_TABLE[technology].DRIVE))
      cdfInfo.tableName = `r_gnss_${feature.toLowerCase()}_k_ui_cdf`
      return cdfInfo
    case reportType === NMEA:
      const nmeaCdfInfo = JSON.parse(JSON.stringify(CDF_TABLE.NMEA))
      nmeaCdfInfo.tableName = `r_${technology.toLowerCase()}_${feature.toLowerCase()}_nmea_cno_cdf_plot`
      return nmeaCdfInfo
    case technology === 'E911':
      return CDF_TABLE[technology].ZAXIS
    default:
      return (
        (technology in CDF_TABLE && feature in CDF_TABLE[technology])
          ? CDF_TABLE[technology][feature]
          : {}
      )
  }
}

const getChiInverse = (archiveCdfs, kpi, percentiles) => {
  percentiles.forEach((p, i) => {
    let probability = i / 100
    // chi2inv probability must be within (0, 1), using these probabilities for better visualization
    if (i === 0) probability = 0.001
    if (i === 100) probability = 0.999
    const reference = Math.sqrt(invChiSquareCDF(probability, 2)) / Math.sqrt(2)
    archiveCdfs[kpi][i] = { ...archiveCdfs[kpi][i], reference }
  })
} 

const CUSTOM_CURVE_FUNCTIONS = {
  GNSS: {
    h_err_uncertainty_ratio: getChiInverse
  }
}

export const getArchiveCdfs = (archivesInfo, archiveLabels, cdfTableInfo, filters, kpis, technology) => {
  const { customFilters } = filters
  const { kpiColumn, percentColumn, segmentColumn, sourceColumn, tableNameColumn } = cdfTableInfo
  const { segment, source, table_name, additional_filter } = customFilters
  const archiveCdfs = {}
  Object.keys(archivesInfo).forEach((archiveId) => {
    const archiveData = archivesInfo[archiveId]
    const isValid = isValidArchiveData(archiveData, archiveId, archiveLabels, filters)
    if (isValid) {
      const [start, end] = filterArchiveData(archiveData, segment, segmentColumn, source, sourceColumn, table_name, tableNameColumn)
      let indices = end ? _.range(start, end) : _.range(archiveData[kpiColumn].length)
      if (additional_filter){
        indices = getIndices(archiveData, indices, additional_filter.col, additional_filter.value)
      }
      kpis.forEach((kpi) => {
        const kpiIdxs = _.find(indices, idx => archiveData[kpiColumn][idx] === kpi)
        const errorString = archiveData[percentColumn][kpiIdxs]
        const errors = errorString ? errorString.split(',').map(entry => Number(entry)) : []
        if (errors.length === 101 && !(kpi in archiveCdfs)) {
          archiveCdfs[kpi] = errors.map((error, percentile) => ({ percentile, [archiveId]: error }))
        } else if (errors.length === 101) {
          errors.forEach((error, percentile) => {
            archiveCdfs[kpi][percentile] = { ...archiveCdfs[kpi][percentile], [archiveId]: error }
          })
        }
      })
    }
  })
  if (!isEmpty(archiveCdfs)) {
    Object.keys(archiveCdfs).forEach((kpi) => {
      if (technology in CUSTOM_CURVE_FUNCTIONS && kpi in CUSTOM_CURVE_FUNCTIONS[technology]) {
        CUSTOM_CURVE_FUNCTIONS[technology][kpi](archiveCdfs, kpi, _.range(101))
      }
    })
  }
  return archiveCdfs
}


const Cdf = ({ archives, technology, feature, filters, title='', visible=true, reportType='' }) => {
  const archiveIds = archives.map(archive => archive.id)
  const cdfTableInfo = getCdfTable(technology, feature, reportType)
  const { tableName } = cdfTableInfo
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, tableName)
  const [cdfState, setCdfState] = useState({
    cdfs: [],
    archiveLabels: {},
    isProcessing: true
  })
  const { errorMessage } = archivesInfo
  const { cdfs, archiveLabels, isProcessing } = cdfState

  useEffect(() => {
    if (!isLoading && !errorMessage && visible) {
      const newArchiveLabels = createArchiveLabels(archives)
      const kpis = getKpis(technology, feature, archivesInfo, cdfTableInfo, filters, reportType)
      const newArchiveCdfs = getArchiveCdfs(archivesInfo, newArchiveLabels, cdfTableInfo, filters, kpis, technology)
      setCdfState({
        cdfs: newArchiveCdfs,
        archiveLabels: newArchiveLabels,
        isProcessing: false
      })
    }
  }, [isLoading, archivesInfo, filters, visible])

  console.log('Rendering Cdf')
  return (
    visible && (
      (errorMessage || (size(cdfs) === 0 && !isProcessing && !isLoading))
        ? <ErrorMessage />
        : (
          <>
            <Suspense fallback={<Spinner visible />}>
              <CdfPlot
                technology={technology}
                feature={feature}
                filters={filters}
                archiveLabels={archiveLabels}
                cdfs={cdfs}
                title={title}
                reportType={reportType}
              />
            </Suspense>
            <Spinner visible={isProcessing || isLoading} />
          </>
        )
    )
  )
}

Cdf.propTypes = {
  archives: PropTypes.array.isRequired,
  technology: PropTypes.string.isRequired
}

export default React.memo(Cdf)
