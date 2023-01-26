/* eslint-disable react/prop-types */
import React, { lazy, useState, useEffect } from 'react'
import { StatePanel } from '@dx/continuum-state-panel'
import { Col, Row } from 'react-bootstrap'
import { Text, Link } from '@tidbits/react-tidbits'


import {
  addToObject,
  setDefaultObject,
  createArchiveLabels,
  isValidArchiveData,
} from '../../../../utilities/helpers'
import {
  idxToPercent,
  searchClosestIdx,
  getCdfPercentiles
} from './helpers'
import { ARCHIVE_REPORTING_LOGS, SUMMARY_TABLE } from '../../../../utilities/constants'
import { useFetchArchiveData } from '../../../../hooks/fetchData'
import Box from '../../../Box'
import E911TableEntry from '../../../Tables/SummaryTable/E911TableEntry'
import SummaryTableLegend from '../../../Tables/SummaryTable/SummaryTableLegend'

const BaseTable = lazy(() => import('../../../Tables/BaseTable'))
const CdfPlot = lazy(() => import('../../../Plots/Cdf/CdfPlot'))
const GroupBarPlot = lazy(() => import('../../../Plots/GroupBarPlot'))

const _ = require('underscore')
const shortid = require('shortid')
const technology = "E911"
const ALTITUDE_ERROR = 'Altitude'
const HORIZONTAL_ERROR = 'Horizontal'
const ERROR_TYPES = [ALTITUDE_ERROR, HORIZONTAL_ERROR]
const LESS_THAN_VALUES = [2, 3, 4]
const TARGET_PERCENTILE = 80
const PERCENTILES = {
  [ALTITUDE_ERROR]: [80],
  [HORIZONTAL_ERROR]: [50, 67, 80, 95, 99, 100]
}

const HEADER_COLUMNS = {
  [ALTITUDE_ERROR]: {
    'Technology': 1,
    '# Valid in NILR Session': 1,
    '# Total Calls': 1,
    'Yield (%)': 1,
    '% of error < 3m / total calls': 1,
    'Percentange of Error < 2m (%)': 1,
    'Percentage of Error < 3m (%)': 1,
    'Percentage of Error < 4m (%)': 1,
    '80th Percentile Error (m)': 1
  },
  [HORIZONTAL_ERROR]: {
    'Technology': 1,
    '# Valid in NILR Session': 1,
    '# Total Calls': 1,
    'Yield (%)': 1,
    '50% (m)': 1,
    '67% (m)': 1,
    '80% (m)': 1,
    '95% (m)': 1,
    '99% (m)': 1,
    'Max (m)': 1,
  }
}

const EXCLUDE_CATEGORIES = {
  [ALTITUDE_ERROR]: [],
  [HORIZONTAL_ERROR]: ['DEMOnlyBaro', 'RefBasedBaro']
}

const ErrorMessage = () => (
  <StatePanel
    message="Error- could not find KPI summary data."
    suggestion="Data may still be processing."
  />
)

const process = (array) => (
  array.filter(entry => entry !== 'null')
    .map(entry => Math.abs(Number(entry)))
    .sort((a, b) => (a > b) ? 1 : -1)
)

const getSessionData = (archivesInfo, archiveLabels, filters, errorType = ALTITUDE_ERROR) => {
  const sessionData = {}
  Object.entries(archivesInfo).forEach(([archiveId, archiveData]) => {
    if (isValidArchiveData(archiveData, archiveId, archiveLabels, filters, ['archives', 'custom'])) {
      let errorColumnName = ''
      let uncertaintyColumnName = ''
      switch (errorType) {
        case HORIZONTAL_ERROR:
          errorColumnName = 'hErrorColumn'
          uncertaintyColumnName = 'hUncertaintyColumn'
          break
        default:
          errorColumnName = 'vErrorColumn'
          uncertaintyColumnName = 'vUncertaintyColumn'

      }
      const { categoryColumn, [errorColumnName]: errorColumn, [uncertaintyColumnName]: uncertaintyColumn } = SUMMARY_TABLE.E911.SESSION
      const errors = archiveData[errorColumn]
      const allNullErrors = errors.reduce((acc, error) => acc && error === 'null', true)
      if (!allNullErrors) {
        errors.forEach((error, rowIdx) => {
          const uncertainty = archiveData[uncertaintyColumn][rowIdx]
          const category = archiveData[categoryColumn][rowIdx]
          if (!EXCLUDE_CATEGORIES[errorType].includes(category)) {
            setDefaultObject(sessionData, category)
            addToObject(sessionData[category], 'errors', [error])
            addToObject(sessionData[category], 'uncertainties', [uncertainty])
          }
        })
      }
    }
  })
  return sessionData
}

const getTableData = (sessionData, testDate, errorType) => {
  const tableData = []
  Object.entries(sessionData).forEach(([category, kpis]) => {
    const { errors } = kpis
    const processedErrors = process(errors)
    const percentLessThanValues = LESS_THAN_VALUES.map(value => (
      idxToPercent(searchClosestIdx(processedErrors, 0, processedErrors.length - 1, value), processedErrors.length)
    ))
    const percentileTargets = PERCENTILES[errorType].map(percentile => getCdfPercentiles(processedErrors)[percentile])
    const tableRow = [
      { value: category },
      { value: processedErrors.length },
      { value: errors.length },
      { value: Math.floor(100 * processedErrors.length / errors.length) },
    ]
    if (errorType === ALTITUDE_ERROR) {
      let count = processedErrors.reduce((n, x) => n + (x <= LESS_THAN_VALUES[1]), 0)
      let userYield = Math.floor(100 * count / errors.length)
      tableRow.push({ 
        value: (
          <E911TableEntry
            category={`${errorType} Quality`}
            kpiName={`<3m`}
            testDate={testDate}
            entry={{ value: category === "NILR" ? userYield.toFixed(2) : '-' }}
          />
        )
       }
      )
      tableRow.push(
        ...percentLessThanValues.map((value, i) => ({
          value: (
            <E911TableEntry
              category={`${errorType} Quality`}
              kpiName={`<${LESS_THAN_VALUES[i]}m`}
              testDate={testDate}
              entry={{ value: value !== undefined ? value.toFixed(2) : '-' }}
            />
          )
        }))
      )
    }
    percentileTargets.forEach((percentileTarget, i) => {
      tableRow.push({
        value: (
          <E911TableEntry
            category={`${errorType} Error`}
            kpiName={`${PERCENTILES[errorType][i]}%`}
            testDate={testDate}
            entry={{ value: percentileTarget !== undefined ? percentileTarget.toFixed(2) : '-' }}
          />
        )
      })
    })
    tableData.push(tableRow)
  })
  return tableData
}

const getCdfData = (sessionData, errorType) => {
  const cdfErrors = {}
  const cdfUncertainties = {}
  Object.entries(sessionData).forEach(([category, kpis]) => {
    const { errors, uncertainties } = kpis
    const processedErrors = process(errors)
    const processedUncertainties = process(uncertainties)
    const errorPercentiles = getCdfPercentiles(processedErrors)
    const uncertaintyPercentiles = getCdfPercentiles(processedUncertainties)
    errorPercentiles.forEach((error, percentile) => {
      addToObject(cdfErrors, `${errorType} Error (m) - ${category}`, [{ percentile, combined: error }])
    })
    uncertaintyPercentiles.forEach((uncertainty, percentile) => {
      addToObject(cdfUncertainties, `${errorType} Error Over Uncertainty - ${category}`, [{ percentile, combined: uncertainty }])
    })

  })
  return [cdfErrors, cdfUncertainties]
}

const getBarPlotData = (sessionData, errorType) => {
  const percentageErrorPlots = {}
  const percentilePlot = {}
  Object.entries(sessionData).forEach(([category, kpis]) => {
    const { errors } = kpis
    const processedErrors = process(errors)
    if (processedErrors.length > 0) {
      if (errorType === ALTITUDE_ERROR) {
        LESS_THAN_VALUES.forEach(value => {
          const percentLessThanValue = idxToPercent(searchClosestIdx(processedErrors, 0, processedErrors.length - 1, value), processedErrors.length)
          const plotName = `Percentage of Error < ${value}m (%)`
          setDefaultObject(percentageErrorPlots, plotName)
          addToObject(percentageErrorPlots[plotName], category, percentLessThanValue.toFixed(2))
        })
      }
      const percentileTarget = getCdfPercentiles(processedErrors)[TARGET_PERCENTILE]
      const plotName = `${TARGET_PERCENTILE}th Percentile Error`
      setDefaultObject(percentilePlot, plotName)
      addToObject(percentilePlot[plotName], category, percentileTarget)
    }
  })
  const barPlots = []
  if (errorType === ALTITUDE_ERROR) {
    barPlots.push({ 
      title: 'Percentage of Error < (%)',
      plots: percentageErrorPlots
    })
  }
  barPlots.push({ 
    title: `${TARGET_PERCENTILE}th Percentile Error`,
    plots: percentilePlot
  })
  return barPlots
}

const initializeData = () => {
  const data = {}
  ERROR_TYPES.forEach((errorType) => {
    data[errorType] = {
      tableData: [],
      cdfErrors: [],
      cdfUncertainties: [],
      barPlotData: [],
    }
  })
  return data
}

const SummaryTableToCSV = (tableData, headerColumns) => {
  const csvHeader = Object.keys(headerColumns).join()
  let csvString = `${csvHeader}\n`
  tableData.forEach((row) => {
    let rowString = ""
    row.forEach((item) => {
      let value
      if (React.isValidElement(item.value)){
        value = item.value.props.entry.value
      } else {
        value = item.value
      }
      if (value) {
        rowString += `${value},`
      }
    })
    if (rowString.slice(-1) === ','){
      rowString = rowString.slice(0, -1)
    }
    csvString += `${rowString}\n`
  })
  return csvString
}

const E911SessionSummary = ({
  archives, feature, filters
}) => {
  const testDate = archives.length > 0 ? archives[0].test_date : ''
  const archiveIds = archives.map(archive => archive.id)
  const { tableName } = SUMMARY_TABLE.E911.SESSION
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, tableName)
  const [state, setState] = useState({
    data: initializeData(),
    isProcessing: true
  })
  const { errorMessage } = archivesInfo
  const { data, isProcessing } = state

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const archiveLabels = createArchiveLabels(archives)
      const newData = {}
      ERROR_TYPES.forEach((errorType) => {
        const sessionData = getSessionData(archivesInfo, archiveLabels, filters, errorType)
        const newTableData = getTableData(sessionData, testDate, errorType)
        const [newCdfErrors, newCdfUncertainties] = getCdfData(sessionData, errorType)
        const newBarPlotData = getBarPlotData(sessionData, errorType)
        newData[errorType] = {
          tableData: newTableData,
          cdfErrors: newCdfErrors,
          cdfUncertainties: newCdfUncertainties,
          barPlotData: newBarPlotData,
          sessionData
        }
      })
      setState({
        data: newData,
        isProcessing: false
      })
    }
  }, [isLoading, archivesInfo, errorMessage, filters])


  const handleDownload = (errorType) => {
    const d_data = new Blob([SummaryTableToCSV(state.data[errorType].tableData, HEADER_COLUMNS[errorType])], {type:'text/json;charset=utf-8,'})
    const url = URL.createObjectURL(d_data);
    const e = document.getElementById(`${tableName} ${errorType} download`)
    e.setAttribute('href', url)
    e.setAttribute('download', `${tableName}_${errorType}_table.csv`)
    e.click()
  }

  const handleDownloadAll = (errorType) => {
    const d_data = new Blob([JSON.stringify(state.data[errorType].sessionData)], {type:'text/json;charset=utf-8,'})
    const url = URL.createObjectURL(d_data);
    const e = document.getElementById(`${tableName} ${errorType} download all`)
    e.setAttribute('href', url)
    e.setAttribute('download', `${tableName}_${errorType}_rawData.json`)
    e.click()
  }

  console.log('Rendering E911SessionSummary')
  return (
    Object.entries(data).map(([errorType, formattedData]) => {
      const { tableData, cdfErrors, cdfUncertainties, barPlotData } = formattedData
      if (!isProcessing && tableData.length === 0) {
        return (
          <Box title={`Z-Axis ${errorType} Error Summary`} type="report-table">
            <ErrorMessage />
          </Box>
        )
      }
      return (
        <div key={shortid.generate()}>
          <Box title={`Z-Axis ${errorType} Error Summary`} type="report-table" isLoading={isProcessing}>
            <Col>
              <Row className="justify-content-end">
                <Text mr="15px" ml="15px" mt="5px">
                  <Link id={`${tableName} ${errorType} download`} href="/" variant="default" onClick={() => handleDownload(errorType)}>Download Table</Link>
                </Text>
                <Text mr="15px" ml="15px" mt="5px">
                  <Link id={`${tableName} ${errorType} download all`} href="/" variant="default" onClick={() => handleDownloadAll(errorType)}>Download Raw</Link>
                </Text>
              </Row>
              <SummaryTableLegend technology={technology} feature={feature} />
              <BaseTable headerColumns={HEADER_COLUMNS[errorType]} tableData={tableData} />
            </Col>
          </Box>
          <Box type="report-plot" isLoading={isProcessing}>
            {barPlotData.map(({ title, plots }) => (
              <GroupBarPlot
                key={shortid.generate()}
                data={plots}
                title={title}
              />
            ))}
          </Box>
          <Box title={`CDF - ${errorType} Error`} type="report-plot" isLoading={isProcessing}>
            <CdfPlot
              technology={technology}
              feature={feature}
              archiveLabels={{ combined: { label: 'combined', color: 'blue' }}}
              cdfs={cdfErrors}
            />
          </Box>
          <Box title={`CDF - ${errorType} Error Over Uncertainty`} type="report-plot" isLoading={isProcessing}>
            <CdfPlot
              technology={technology}
              feature={feature}
              archiveLabels={{ combined: { label: 'combined', color: 'blue' }}}
              cdfs={cdfUncertainties}
            />
          </Box>
        </div>
      )
    }
  ))
}

export default React.memo(E911SessionSummary)
