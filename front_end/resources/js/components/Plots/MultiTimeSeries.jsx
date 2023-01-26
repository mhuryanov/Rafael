import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { StatePanel } from '@dx/continuum-state-panel'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import Dygraph from 'dygraphs'

import { ARCHIVE_REPORTING_LOGS, KPI_TABLE, KPI_NAMES, FITNESS_FEATURES } from '../../utilities/constants'
import { addToObject, size, formatTimeStamp, isValidArchiveData, createArchiveLabels, setDefaultObject } from '../../utilities/helpers'
import { useFetchArchiveData } from '../../hooks/fetchData'
import RangeSelect from '../Widgets/RangeSelect'
import { sync } from './synchronize'

sync(Dygraph)

const getKpiTable = (technology, feature) => {
  switch (true) {
    case technology === 'GNSS' && FITNESS_FEATURES.includes(feature):
      const kpiTableInfo = JSON.parse(JSON.stringify(KPI_TABLE[technology].DRIVE))
      kpiTableInfo.tableName = `r_gnss_${feature.toLowerCase()}_k_ui_level3`
      return kpiTableInfo
    default:
      return (
        (technology in KPI_TABLE && feature in KPI_TABLE[technology])
          ? KPI_TABLE[technology][feature]
          : {}
      )
  }
}

const ErrorMessage = () => (
  <StatePanel
    message="Error- could not find time series data."
    suggestion="Data may still be processing."
  />
)

const getKpis = (technology, feature, archivesInfo, filters) => {
  if (technology == "GNSS" && ['WiFi', 'WiFi2'].includes(filters.customFilters.source)) { 
    return filters.kpis.filter(kpi => !["sp_err", "c_err"].includes(kpi))
  } else {
    return filters.kpis
  }
}

const getTimeSeriesData = (archivesInfo, archiveLabels, technology, feature, filters) => {
  const { columns } = getKpiTable(technology, feature)
  const [timeStampCol, sourceCol, segmentCol] = columns
  const { customFilters } = filters
  const { segment, source } = customFilters
  const kpis = getKpis(technology, feature, archivesInfo, filters)
  const data = {}
  const kpiRanges = {}
  let minTime
  let maxTime
  Object.keys(archivesInfo).forEach((archiveId, idx) => {
    const archiveData = archivesInfo[archiveId]
    const isValid = isValidArchiveData(archiveData, archiveId, archiveLabels, filters, ['custom'])
    if (isValid) {
      const validIndices = archiveData[sourceCol]
        .map((archiveSource, i) => i)
        .filter(i => archiveData[sourceCol][i] === source)
        .filter(i => archiveData[segmentCol][i] === segment || segment === 'ENTIREDRIVE')
      validIndices.forEach((rowIdx) => {
        const timeStamp = formatTimeStamp(archiveData[timeStampCol][rowIdx])
        minTime = minTime ? Math.min(minTime, timeStamp) : timeStamp
        maxTime = maxTime ? Math.max(maxTime, timeStamp) : timeStamp
        kpis.filter(kpi => source !== 'WiFi' || source !== 'WiFi2' || kpi.includes('v_err') || kpi.includes('h_err')).forEach((kpi) => {
          if (!(archiveData.hasOwnProperty(kpi))) {  // check if kpi in archiveData
            return
          }
          const archiveKpis = archiveData[kpi]
          setDefaultObject(kpiRanges, kpi)
          if (archiveKpis.length > 0) {
            const archiveKpi = Number(archiveKpis[rowIdx]) || ''
            kpiRanges[kpi].min = 'min' in kpiRanges[kpi] ? Math.min(kpiRanges[kpi].min, archiveKpi) : archiveKpi
            kpiRanges[kpi].max = 'max' in kpiRanges[kpi] ? Math.max(kpiRanges[kpi].max, archiveKpi) : archiveKpi
            let entry = `${timeStamp},`
            for (let i = 0; i < size(archivesInfo); i += 1) {
              if (i === idx) {
                entry += `${archiveKpi},`
              } else {
                entry += ','
              }
            }
            entry = entry.replace(/.$/, '\n')
            addToObject(data, kpi, entry)
          }
        })
      })
    }
  })
  return [data, minTime, maxTime, kpiRanges]
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


const MultiTimeSeries = ({ archives, technology, feature, filters, allKpis, title, visible }) => {
  const archiveIds = archives.map(archive => archive.id)
  const { tableName, columns = [] } = getKpiTable(technology, feature)
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, tableName, columns.concat(allKpis))
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
      const [newData, minTime, maxTime, kpiRanges] = getTimeSeriesData(archivesInfo, archiveLabels, technology, feature, filters)
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
              title: `${title}, ${KPI_NAMES.GNSS[kpi]}`,
              labels,
              axisLabelFontSize: 12,
              axes: {
                x: {
                  pixelsPerLabel: 120
                },
                y: {
                  valueRange: [kpiRanges[kpi].min < 0 ? kpiRanges[kpi].min * 1.1 : 0, kpiRanges[kpi].max * 1.1]
                }
              },
              ylabel: KPI_NAMES.GNSS[kpi],
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

export default React.memo(MultiTimeSeries)
