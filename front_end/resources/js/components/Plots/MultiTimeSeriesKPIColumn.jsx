import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { StatePanel } from '@dx/continuum-state-panel'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import Dygraph from 'dygraphs'

import { ARCHIVE_REPORTING_LOGS, KPI_TABLE, KPI_NAMES, FITNESS_FEATURES, NMEA } from '../../utilities/constants'
import { addToObject, size, formatTimeStamp, isValidArchiveData, createArchiveLabels, getIndices } from '../../utilities/helpers'
import { useFetchArchiveData } from '../../hooks/fetchData'
import RangeSelect from '../Widgets/RangeSelect'
import { sync } from './synchronize'

sync(Dygraph)

const getKpiTable = (technology, feature, reportType='') => {
  switch (true) {
    case reportType === 'NMEA':
      const kpiTableInfo = JSON.parse(JSON.stringify(KPI_TABLE[NMEA]))
      kpiTableInfo.tableName = `r_${technology.toLowerCase()}_${feature.toLowerCase()}_nmea_cno_timeseries_plot`
      return kpiTableInfo
    default:
      return (
        (technology in KPI_TABLE && feature in KPI_TABLE[technology])
          ? KPI_TABLE[technology][feature]
          : {}
      )
  }
}

const getKpiName = (technology, feature, filters, kpi, reportType='') => {
  if (reportType === 'NMEA'){
    const { additional_filter } = filters.customFilters
    if (additional_filter) {
      const nmea_report_type = additional_filter.value
      return KPI_NAMES[reportType][nmea_report_type][kpi] || kpi 
    }
    else {
      return KPI_NAMES[reportType]["cno"][kpi] || kpi 
    } 
  } 
  if (technology !== 'GNSS') return kpi
  if (technology === 'GNSS' && feature === 'TTFF' && reportType === '') {
    const { customFilters } = filters
    const { source, table_name } = customFilters
    return TTFF_KPI_MAPPING[source][table_name][kpi]
  }
  return KPI_NAMES[technology][kpi] || kpi  
}

const ErrorMessage = () => (
  <StatePanel
    message="Error- could not find time series data."
    suggestion="Data may still be processing."
  />
)

const getTimeSeriesData = (archivesInfo, archiveLabels, technology, feature, filters, reportType="") => {
  const { columns } = getKpiTable(technology, feature, reportType)
  const [sourceCol, plotNameCol, categoryCol, valueCol, timeStampCol] = columns
  const { customFilters } = filters
  const { segment } = customFilters
  const data = {}
  let minTime
  let maxTime
  Object.keys(archivesInfo).forEach((archiveId, idx) => {
    const archiveData = archivesInfo[archiveId]
    const isValid = isValidArchiveData(archiveData, archiveId, archiveLabels, filters, ['custom'])
    if (isValid) {
      const validIndices = getIndices(archiveData, _.range(archiveData[sourceCol].length), sourceCol, segment)
  
      validIndices.forEach((rowIdx) => {
        const timeStamp = formatTimeStamp(archiveData[timeStampCol][rowIdx])
        minTime = minTime ? Math.min(minTime, timeStamp) : timeStamp
        maxTime = maxTime ? Math.max(maxTime, timeStamp) : timeStamp
        const category = archiveData[categoryCol][rowIdx]
        const value = archiveData[valueCol][rowIdx]
        let entry = `${timeStamp},`
        for (let i = 0; i < size(archivesInfo); i += 1) {
          if (i === idx) {
            entry += `${value},`
          } else {
            entry += ','
          }
        }
        entry = entry.replace(/.$/, '\n')
        addToObject(data, category, entry)
      })
    }
  })
  return [data, minTime, maxTime]
}

const renderLegend = ({ dygraph, series, x, xHTML }) => {
  let legendHTML = ''
  if (xHTML) {
    legendHTML += `Time: ${xHTML}<br>`
  }
  series.forEach((plot) => {
    const { color, labelHTML, y } = plot
    if (y !== undefined) {
      legendHTML += `<span class="color-block" style="background-color: ${color};"></span>`
      legendHTML += `${labelHTML}: ${y}`
    }
  })
  return legendHTML
}

const getSeries = (archiveIds, archiveLabels, pointSize = 3) => {
  const series = {}
  archiveIds.forEach((archiveId) => {
    const { label: deviceName, color } = archiveLabels[archiveId]
    series[deviceName] = {
      color,
      pointSize
    }
  })
  return series
}


const MultiTimeSeriesKPIColumn = ({ archives, technology, feature, filters, allKpis, title, visible, reportType='' }) => {
  const archiveIds = archives.map(archive => archive.id)
  const { tableName, columns = [] } = getKpiTable(technology, feature, reportType)
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, tableName, columns)
  const [timeRange, setTimeRange] = useState({
    lower: 0,
    upper: 0
  })
  const [plotState, setPlotState] = useState({
    plots: [],
    isProcessing: true
  })
  const { errorMessage } = archivesInfo
  const { plots, isProcessing } = plotState

  const zoomCallback = (localMinTime, localMaxTime) => {
    setTimeRange(prevState => ({
      ...prevState,
      lower: Math.floor(localMinTime),
      upper: Math.floor(localMaxTime)
    }))
  }

  const handleTimeRangeSelect = (newLower, newUpper) => {
    setPlotState((prevState) => {
      const { plots: prevPlots } = prevState
      prevPlots.forEach(plot => plot.updateOptions({ dateWindow: [newLower, newUpper] }))
      return {
        plots: prevPlots,
        isProcessing: false
      }
    })
  }

  const plotCleanup = () => {
    plots.forEach((plot) => { plot.destroy() })
    allKpis.forEach((kpi) => { document.getElementById(kpi).style = '' })
  }

  useEffect(() => {
    if (!isLoading && !errorMessage && visible) {
      const archiveLabels = createArchiveLabels(archives)
      const [newData, minTime, maxTime] = getTimeSeriesData(archivesInfo, archiveLabels, technology, feature, filters, reportType)
      plotCleanup()
      const archiveIdsToShow = Object.keys(archivesInfo)
      const labels = ['timestamp'].concat(archiveIdsToShow.map(archiveId => archiveLabels[archiveId].label))
      const series = getSeries(archiveIdsToShow, archiveLabels)
      const newPlots = []
      Object.keys(newData).forEach((kpi) => {
        newPlots.push(
          new Dygraph(
            document.getElementById(kpi),
            newData[kpi], {
              height: 300,
              width: '90%',
              title: `${title}, ${getKpiName(technology, feature, filters, kpi, reportType)}`,
              labels,
              axisLabelFontSize: 12,
              axes: {
                x: {
                  pixelsPerLabel: 120
                }
              },
              ylabel: getKpiName(technology, feature, filters, kpi, reportType),
              xlabel: 'IOS Time',
              connectSeparatedPoints: true,
              drawPoints: true,
              legendFormatter: renderLegend,
              zoomCallback,
              highlightSeriesOpts: {
                strokeBorderWidth: 1,
                highlightCircleSize: 6
              },
              series
            }
          )
        )
      })
      if (newPlots.length > 1) {
        Dygraph.synchronize(newPlots, {
          zoom: true,
          selection: true,
          range: false
        })
      }
      setPlotState({
        isProcessing: false,
        plots: newPlots
      })
      setTimeRange({
        lower: Math.floor(minTime),
        upper: Math.floor(maxTime)
      })
    }
  }, [isLoading, archivesInfo, archives, filters, visible])

  return (
    visible && (
      <>
        {errorMessage || (plots.length === 0 && !isProcessing && !isLoading) ? (
          <ErrorMessage />
        ) : (
          <>
            <Spinner visible={isProcessing || isLoading} />
            <RangeSelect range={timeRange} setRange={setTimeRange} callBack={handleTimeRangeSelect} step={10} />
          </>
        )}
        <div style={{ width: '95%' }}>
          {allKpis.map(kpi => (
            <div key={kpi} className="dygraphs-timeseries" id={kpi} />
          ))}
        </div>
      </>
    )
  )
}

export default React.memo(MultiTimeSeriesKPIColumn)
