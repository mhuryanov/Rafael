import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { StatePanel } from '@dx/continuum-state-panel'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { Icons } from '@tidbits/react-tidbits' 
import Dygraph from 'dygraphs'

import { ARCHIVE_REPORTING_LOGS, KPI_TABLE, KPI_NAMES } from '../../utilities/constants'
import {
  addToObject,
  size,
  checkCustomFilters,
  createArchiveLabels,
  isEmpty,
  filterArchiveData,
  isValidArchiveData,
  getIndices,
} from '../../utilities/helpers'
import { useFetchArchiveData } from '../../hooks/fetchData'
import RangeSelect from '../Widgets/RangeSelect'
import { sync } from './synchronize'
import { SelectDropdown } from '@dx/continuum-select-dropdown'

const _ = require('underscore')

sync(Dygraph)


const ErrorMessage = () => (
  <StatePanel
    message="Error- could not find time series data."
    suggestion="Data may still be processing."
  />
)

const getTimeSeriesData = (archivesInfo, archiveLabels, technology, filters, plotMapping, selectedPlot) => {
  const { columns } = KPI_TABLE[technology]
  const [sourceCol, plotNameCol, categoryCol, valueCol, timeStampCol] = columns
  const { customFilters } = filters
  const { source } = customFilters
  const data = {}
  let minTime
  let maxTime
  Object.keys(archivesInfo).forEach((archiveId, archiveIdx) => {
    const archiveData = archivesInfo[archiveId]
    const isValid = isValidArchiveData(archiveData, archiveId, archiveLabels, filters)
    if (isValid) {
      const sourceIndices = getIndices(archiveData, _.range(archiveData[sourceCol].length), sourceCol, source)
      const plotIndices = getIndices(archiveData, sourceIndices, plotNameCol, selectedPlot)
      plotMapping[selectedPlot].forEach((category) => {
        const categoryIndices = getIndices(archiveData, plotIndices, categoryCol, category)
        categoryIndices.forEach((index) => {
          const timeStamp = archiveData[timeStampCol][index]
          minTime = minTime ? Math.min(minTime, timeStamp) : timeStamp
          maxTime = maxTime ? Math.max(maxTime, timeStamp) : timeStamp
          const value = archiveData[valueCol][index]
          let entry = `${timeStamp},`
          for (let i = 0; i < size(archivesInfo); i += 1) {
            if (i === archiveIdx) {
              entry += `${value},`
            } else {
              entry += ','
            }
          }
          entry = entry.replace(/.$/, '\n')
          addToObject(data, `${selectedPlot}, ${category}`, entry)
        })
      })
    }
  })
  return [data, minTime, maxTime]
}

const getPlotMapping = (archivesInfo, technology, filters) => {
  const { columns } = KPI_TABLE[technology]
  const [sourceCol, plotNameCol, categoryCol] = columns
  const { tables, customFilters } = filters
  const { source, allTables } = customFilters
  const plotsToHide = allTables.filter(table => !tables.includes(table))
  const plotMapping = {}
  Object.entries(archivesInfo).forEach(([archiveId, archiveData]) => {
    const isValid = !isEmpty(archiveData)
      && checkCustomFilters(customFilters, archiveData)
    if (isValid) {
      const [start, end] = filterArchiveData(archiveData, undefined, undefined, source, sourceCol, undefined, undefined)
      const plotNames = archiveData[plotNameCol].slice(start, end)
      const categories = archiveData[categoryCol].slice(start, end)
      plotNames.forEach((plotName, i) => {
        const category = categories[i]
        if (!plotsToHide.includes(plotName)
          && (!(plotName in plotMapping) || !plotMapping[plotName].includes(category))) {
          addToObject(plotMapping, plotName, [category])
        }
      })
    }
  })
  return plotMapping
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


const MultiTimeSeries = ({ archives, technology, filters, title, visible }) => {
  const archiveIds = archives.map(archive => archive.id)
  const { tableName, columns } = KPI_TABLE[technology]
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, tableName, columns)
  const [plotMapping, setPlotMapping] = useState({})
  const [selectedPlot, setSelectedPlot] = useState('')
  const [showRange, setShowRange] = useState(false)
  const [timeRange, setTimeRange] = useState({})
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

  const handleRangeToggle = () => {
    setShowRange(prevShowRange => !prevShowRange)
  }

  const plotCleanup = () => {
    plots.forEach((plot) => { plot.destroy() })
    plotMapping[selectedPlot].forEach((category) => {
      const plotDiv = document.getElementById(`${selectedPlot}, ${category}`)
      plotDiv.style = ''
    })
  }

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const newPlotMapping = getPlotMapping(archivesInfo, technology, filters)
      setPlotMapping(newPlotMapping)
      if (!(selectedPlot in newPlotMapping)) setSelectedPlot(Object.keys(newPlotMapping)[0])
    }
  }, [isLoading, errorMessage, archivesInfo, archives, filters])

  useEffect(() => {
    if (visible && !isEmpty(plotMapping) && selectedPlot) {
      const archiveLabels = createArchiveLabels(archives)
      const [newData, minTime, maxTime] = getTimeSeriesData(archivesInfo, archiveLabels, technology, filters, plotMapping, selectedPlot)
      plotCleanup()
      const archiveIdsToShow = Object.keys(archivesInfo)
      const labels = ['timestamp'].concat(archiveIdsToShow.map(archiveId => archiveLabels[archiveId].label))
      const series = getSeries(archiveIdsToShow, archiveLabels)
      const newPlots = []
      Object.keys(newData).forEach((plotKey) => {
        newPlots.push(
          new Dygraph(
            document.getElementById(plotKey),
            newData[plotKey], {
              height: 300,
              width: '90%',
              title: `${title}, ${plotKey}`,
              labels,
              axisLabelFontSize: 12,
              axes: {
                x: {
                  pixelsPerLabel: 120
                }
              },
              ylabel: plotKey.split(', ')[1],
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
      if (!isEmpty(timeRange)) {
        newPlots.forEach(plot => plot.updateOptions({ dateWindow: [timeRange.lower, timeRange.upper] }))
      } else {
        setTimeRange({
          lower: Math.floor(minTime),
          upper: Math.floor(maxTime)
        })
      }
    }
  }, [plotMapping, visible, selectedPlot])

  const handleSelectPlot = (option) => {
    const { value } = option
    setSelectedPlot(value)
  }


  return (
    visible && (
      <div className="e911-time-series-container">
        {errorMessage || (plots.length === 0 && !isProcessing && !isLoading) ? (
          <ErrorMessage />
        ) : (
          <>
            <Row className="justify-content-center" style={{ marginBottom: '10px' }}>
              <Col style={{ maxWidth: '300px' }}>
                <SelectDropdown
                  onChange={handleSelectPlot}
                  value={{ label: selectedPlot, value: selectedPlot }}
                  options={Object.keys(plotMapping).map(plotName => ({ label: plotName, value: plotName }))}
                />
              </Col>
              <Col style={{ minWidth: '40px', maxWidth: '40px' }}>
                <div onClick={handleRangeToggle} style={{ cursor: 'pointer' }}>
                  {showRange ? <Icons.UpIcon color="blue" width="15px" height="12px" /> : <Icons.DownIcon color="blue" width="15px" height="12px" />}
                </div>
              </Col>
            </Row>
            {showRange && <RangeSelect range={timeRange} setRange={setTimeRange} callBack={handleTimeRangeSelect} step={10} />}
            <Spinner visible={isProcessing || isLoading} />
          </>
        )}
        {selectedPlot && (
          <div style={{ width: '95%' }}>
            {plotMapping[selectedPlot].map(category => (
              <div className="dygraphs-timeseries" key={`${selectedPlot}, ${category}`} id={`${selectedPlot}, ${category}`} />
            ))}
          </div>
        )}
      </div>
    )
  )
}

export default React.memo(MultiTimeSeries)
