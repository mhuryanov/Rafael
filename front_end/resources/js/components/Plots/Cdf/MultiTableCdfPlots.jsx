/* eslint-disable react/prop-types */
import React, { lazy, useState, useEffect } from 'react'

import {
  createArchiveLabels,
  isValidArchiveData,
  filterArchiveData,
  getIndices,
  isEmpty,
} from '../../../utilities/helpers'
import { ARCHIVE_REPORTING_LOGS, CDF_TABLE } from '../../../utilities/constants'
import { useFetchArchiveData } from '../../../hooks/fetchData'
import Box from '../../Box'

const CdfPlot = lazy(() => import('./CdfPlot'))


const _ = require('underscore')
const shortid = require('shortid')

const getCdfTable = (technology, feature) => {
  switch (true) {
    default:
      return (
        (technology in CDF_TABLE && feature in CDF_TABLE[technology])
          ? CDF_TABLE[technology][feature]
          : {}
      )
  }
}

export const getMultiTableArchiveCdfs = (archivesInfo, archiveLabels, cdfTableInfo, filters, kpis, tables) => {
  const { customFilters } = filters
  const { kpiColumn, percentColumn, segmentColumn, sourceColumn, tableNameColumn, itemColumn} = cdfTableInfo
  const { segment, source, additional_filter } = customFilters
  const tableArchiveCdfs = {}
  tables.forEach(table_name => {
    const archiveCdfs = {}
    Object.keys(archivesInfo).forEach((archiveId) => {
      const archiveData = archivesInfo[archiveId]
      const isValid = isValidArchiveData(archiveData, archiveId, archiveLabels, filters)
      if (isValid) {
        const [start, end] = filterArchiveData(archiveData, segment, segmentColumn, source, sourceColumn, table_name, tableNameColumn)
        if (start < 0) {
          return
        }
        let indices = end ? _.range(start, end) : _.range(archiveData[kpiColumn].length)
        if (additional_filter){
          indices = getIndices(archiveData, indices, additional_filter.col, additional_filter.value)
        }
        kpis.forEach((kpi) => {
          const kpiIdxs = _.filter(indices, idx => archiveData[kpiColumn][idx] === kpi)
          if (kpiIdxs.length) {
            kpiIdxs.forEach( (kpiIdx, idx) => {
              const archive_item = itemColumn ? `${archiveId} ${archiveData[itemColumn][kpiIdx]}` : `${archiveId}`
              const errorString = archiveData[percentColumn][kpiIdx]
              const errors = errorString ? errorString.split(',').map(entry => Number(entry)) : []
              if (errors.length === 101 && !(kpi in archiveCdfs)) {
                archiveCdfs[kpi] = errors.map((error, percentile) => ({ percentile, [archive_item]: error }))
              } else if (errors.length === 101) {
                errors.forEach((error, percentile) => {
                  archiveCdfs[kpi][percentile] = { ...archiveCdfs[kpi][percentile], [archive_item]: error }
                })
              }
            })  // for each percentile: 0, 1, 2....100
          }  // for all items
        }) // for all KPIs
      }
    })
    if (!isEmpty(archiveCdfs)) {
      tableArchiveCdfs[table_name] = archiveCdfs
    }
  })
  return tableArchiveCdfs
}

const getKpis = (technology, feature, archivesInfo, cdfTableInfo, filters) => {
  const { kpiColumn } = cdfTableInfo
  let kpis = []
  Object.values(archivesInfo).forEach((archiveData) => {
    const archiveKpis = archiveData[kpiColumn]
    kpis = _.uniq(kpis.concat(archiveKpis)).filter(kpi => kpi)
  })
  return kpis
}

const getTableNames = (technology, feature, archivesInfo, cdfTableInfo, filters) => {
  const { tableNameColumn } = cdfTableInfo
  let tables = []
  Object.values(archivesInfo).forEach((archiveData) => {
    const archiveTables = archiveData[tableNameColumn]
    tables = _.uniq(tables.concat(archiveTables)).filter(table => table)
  })
  return tables
}

const MultiTableCdfPlots = ({
  archives,
  technology,
  feature,
  filters
}) => {
  const archiveIds = archives.map(archive => archive.id)
  const cdfTableInfo = getCdfTable(technology, feature)
  const { tableName, columns } = cdfTableInfo
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, tableName, columns)
  const [cdfState, setCdfState] = useState({
    multiTableCdfs: {},
    archiveLabels: {},
    isProcessing: true
  })
  const { errorMessage } = archivesInfo
  const { multiTableCdfs, archiveLabels, isProcessing } = cdfState

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const newArchiveLabels = createArchiveLabels(archives)
      const kpis = getKpis(technology, feature, archivesInfo, cdfTableInfo, filters)
      const tables = getTableNames(technology, feature, archivesInfo, cdfTableInfo, filters)
      const newMultiTableArchiveCdfs = getMultiTableArchiveCdfs(archivesInfo, newArchiveLabels, cdfTableInfo, filters, kpis, tables)
      setCdfState({
        multiTableCdfs: newMultiTableArchiveCdfs,
        archiveLabels: newArchiveLabels,
        isProcessing: false
      })
    }
  }, [isLoading, archivesInfo, filters])

  console.log('Rendering MultiTableCdfPlots')
  return (
    <>
    {Object.entries(multiTableCdfs).map(([table, cdf]) => (
      <div key={table}>
        <Box title={`CDF - ${table}`} type="report-plot" isLoading={isProcessing}>
            <CdfPlot
              technology={technology}
              feature={feature}
              archiveLabels={archiveLabels}
              cdfs={cdf}
            />
          </Box>
        </div>
      )
    )}
    </>
  )
}

export default React.memo(MultiTableCdfPlots)