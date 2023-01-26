import React, { Suspense, lazy, useEffect, useState, memo } from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'react-bootstrap'
import { StatePanel } from '@dx/continuum-state-panel'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import {
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ReferenceArea,
  ScatterChart, Scatter, ResponsiveContainer
} from 'recharts'
import { Button } from '@dx/continuum-button'

import { useFetchArchiveData } from '../../hooks/fetchData'
import {
  KPI_TABLE,
  ARCHIVE_REPORTING_LOGS,
  COLOR_ARRAY,
  CTP_LEVEL3_TABLE,
  L5_EVENTPLOT_TABLE,
  PERFORMANCE
} from '../../utilities/constants'
import {
  size,
  isEmpty,
  filterToggle,
  addToObject,
  setDefaultObject,
  formatTimeStamp
} from '../../utilities/helpers'
import RangeSelect from '../Widgets/RangeSelect'
import FilterTable from '../Tables/FilterTable'

const _ = require('underscore')

const DEFAULT_LOWER_BOUND = -2000
const DEFAULT_UPPER_BOUND = 20000

const tableOrder = {
  GNSS: {
    TTFF: [
      'Assistance&',
      'Gpssa Horizontal Error&Horizontal Error',
      'Gpssa Vertical Error&Vertical Error',
      'ClPos Horizontal Error&Horizontal Error',
      'ClPos Vertical Error&Vertical Error',
      'Wifi Horizontal Error&Horizontal Error',
      'Gpssa TTF&TTF',
      'ClPos TTF&TTF',
      'Wifi TTF&TTF',
      'Gpssa Horizontal Unc&Horizontal Uncertainity',
      'ClPos Horizontal Unc&Horizontal Uncertainity',
      'ClPos TTF 50M Unc&TTF'
    ]
  }
}

const ErrorMessage = () => (
  <div className="cdf-error">
    <StatePanel
      message="Error- could not find time series data."
      suggestion="Data may still be processing."
    />
  </div>
)

const getTableInfo = (technology, feature, reportType) => {
  switch (true) {
    case reportType === 'CTP':
      return { ...CTP_LEVEL3_TABLE, tableName: `r_${technology.toLowerCase()}_${feature.toLowerCase()}_ctp_level3` }
    case reportType === 'L5':
      return { ...L5_EVENTPLOT_TABLE, tableName: `r_${technology.toLowerCase()}_${feature.toLowerCase()}_l5_state_plot` }
    default:
      return KPI_TABLE[technology][feature]
  }
}

const sortData = (noSessionData, sessionData, technology, feature) => {
  switch (true) {
    case technology === 'GNSS' && feature === 'TTFF':
      const newSessionData = {}
      tableOrder[technology][feature].forEach((dataKey) => {
        if (sessionData[dataKey]) newSessionData[dataKey] = sessionData[dataKey]
      })
      return [noSessionData, newSessionData]
    default:
      return [noSessionData, sessionData]
  }
}

export const getTimeSeriesData = (archivesInfo, technology, feature, columns) => {
  const [timeStampCol, tableNameCol, sessionNameCol, labelCol, doubleValueCol, enumValueCol, descriptionCol, groupCol] = columns
  const noSessionData = {}
  const sessionData = {}
  const sessionColors = {}
  const enumMapping = {}
  let colorIndex = 0
  let minTime
  let maxTime
  _.each(archivesInfo, (archiveData, archiveId) => {
    if (!isEmpty(archiveData)) {
      const sessionNames = archiveData[sessionNameCol] || archiveData[tableNameCol].map(() => '')
      const tableNames = archiveData[tableNameCol]
      const doubleValues = archiveData[doubleValueCol]
      const timeStamps = archiveData[timeStampCol]
      const labels = archiveData[labelCol]
      const enumValues = archiveData[enumValueCol]
      const descriptions = descriptionCol ? archiveData[descriptionCol] : []
      const group = groupCol ? archiveData[groupCol] : []
      sessionNames.forEach((session, i) => {
        const table = tableNames[i]
        const value = doubleValues[i] === 'null' ? 1 : doubleValues[i]
        const time = formatTimeStamp(timeStamps[i])
        if (String(time).length < 9) return // invalid log/ios time
        const label = labels[i]
        const dataKey = `${table}&${label}`
        const enumValue = enumValues[i]
        const description = descriptions[i] || 'null'
        const info = description !== 'null' ? description : null
        minTime = minTime ? Math.min(minTime, time) : time
        maxTime = maxTime ? Math.max(maxTime, time) : time
        const dataPoint = {
          time,
          value,
          description: { info }
        }
        setDefaultObject(enumMapping, table)
        if (enumValue && enumValue !== 'null') enumMapping[table][value] = enumValue
        if (session.replace(/ /g, '') === '' || session === 'null') {
          if (enumMapping[table][value]) {
            setDefaultObject(noSessionData, dataKey)
            addToObject(noSessionData[dataKey], enumValue, [dataPoint])
          } else {
            addToObject(noSessionData, dataKey, [dataPoint])
          }
        } else {
          setDefaultObject(sessionData, dataKey)
          if (!(session in sessionColors)) {
            sessionColors[session] = COLOR_ARRAY[colorIndex]
            colorIndex += 1
          }
          dataPoint.description.session = session
          addToObject(sessionData[dataKey], `${session}&${sessionColors[session]}`, [dataPoint])
        }
      })
    }
  })
  const [sortedNoSessionData, sortedSessionData] = sortData(noSessionData, sessionData, technology, feature)
  return [sortedNoSessionData, sortedSessionData, minTime, maxTime, sessionColors, enumMapping]
}

const YAxisLabel = ({ value, viewBox }) => {
  const {x, height} = viewBox
  return (
    <text fontSize="small" transform={`translate(${x}, ${Math.floor(height * 2/3)}) rotate(-90)`}>{value}</text>
  )
}

const renderXTick = ({ x, y, payload }, technology, feature) => {
  const { value } = payload
  let xTick
  switch (true) {
    case technology === 'GNSS' && feature === 'TTFF':
      xTick = value
      break
    default:
      xTick = (new Date(value)).toUTCString().split(' ')[4]
      break
  }
  return <text fontSize="small" x={x} y={y + 10} textAnchor="middle">{xTick}</text>
}

const renderEnumYTick = ({ x, y, payload }, enumMapping) => {
  const { value } = payload
  return <text fontSize="small" x={x} y={y} textAnchor="end">{enumMapping[value]}</text>
}

const renderNumberYTick = ({ x, y, payload }) => {
  const { value } = payload
  return <text fontSize="small" x={x} y={y} textAnchor="end">{value.toFixed(0)}</text>
}

const renderTooltip = ({ active, payload }, technology, feature, label, enumValue) => {
  if (active && Array.isArray(payload) && payload.length > 0) {
    const { time, value, description } = payload[0].payload
    const { session, info } = description
    let timeStamp
    let valueToShow = value
    switch (true) {
      case technology === 'GNSS' && feature === 'TTFF':
        timeStamp = time
        break
      default:
        timeStamp = (new Date(time)).toUTCString()
    }
    if (!isEmpty(enumValue)) {
      valueToShow = enumValue[value]
    }
    return (
      <div className="custom-tooltip box">
        {session && <div>{session}</div>}
        <div>{`${label || 'Value'}: ${valueToShow}`}</div>
        <div>{`Time: ${timeStamp}`}</div>
        {info && <div className="description-info">{info}</div>}
      </div>
    )
  }
  return null
}

const getScatter = (data, dataKey, table, filters, enumMapping, isSession) => {
  switch (true) {
    case isSession && isEmpty(enumMapping[table]):
      return (
        Object.keys(data).filter((session) => {
          const [sessionName] = session.split('&')
          return filters.sessions.includes(sessionName)
        }).map((session) => {
          const [sessionName, sessionColor] = session.split('&')
          return (
            <Scatter
              line
              strokeLinejoin
              key={dataKey + sessionName}
              isAnimationActive={false}
              fill={sessionColor}
              data={data[session]}
              name={sessionName}
            />
          )
        })
      )
    case isSession && !isEmpty(enumMapping[table]):
      return (
        Object.keys(data).filter((session) => {
          const [sessionName] = session.split('&')
          return filters.sessions.includes(sessionName)
        }).map((session) => {
          const [sessionName, sessionColor] = session.split('&')
          const getDataPoints = () => {
            if (table !== 'Fence Status') return data[session]
            const dataPoints = []
            let prevDataPoint
            data[session].forEach((dataPoint) => {
              const { time } = dataPoint
              if (prevDataPoint) {
                const { value, description } = prevDataPoint
                const placeHolderPoint = {
                  time,
                  value,
                  description
                }
                dataPoints.push(placeHolderPoint)
              }
              dataPoints.push(dataPoint)
              prevDataPoint = JSON.parse(JSON.stringify(dataPoint))
            })
            return dataPoints
          }
          const dataPoints = getDataPoints()
          return (
            <Scatter
              line={['Fence Status', 'L5 State'].indexOf(table) >= 0}
              lineJointType={table === 'L5 State' ? 'stepAfter' : undefined}
              key={dataKey + sessionName}
              isAnimationActive={false}
              fill={sessionColor}
              data={dataPoints}
              name={sessionName}
            />
          )
        })
      )
    case !isEmpty(enumMapping[table]):
      return (
        Object.keys(data).map((eventType, i) => (
          <Scatter
            key={eventType}
            isAnimationActive={false}
            fill={COLOR_ARRAY[Object.keys(enumMapping[table]).find(val => enumMapping[table][val] === eventType)]}
            data={data[eventType]}
            name={eventType}
          />
        ))
      )
    default:
      return (
        <Scatter
          line
          fill="purple"
          isAnimationActive={false}
          data={data}
          name={table}
        />
      )
  }
}

const getYAxis = (table, yAxisState, axisLabel, yRange, enumMapping) => {
  const renderYTick = props => (
    !isEmpty(enumMapping[table])
      ? renderEnumYTick(props, enumMapping[table])
      : renderNumberYTick(props)
  )
  const ticks = (
    !isEmpty(enumMapping[table])
      ? Object.keys(enumMapping[table])
      : []
  )
  switch (true) {
    case table === 'Location to Fence':
      return (
        <YAxis
          label={<YAxisLabel value={axisLabel} />}
          allowDataOverflow
          tick={renderYTick}
          interval={0}
          dataKey="value"
          type="number"
          domain={yAxisState.bottom ? [yAxisState.bottom, yAxisState.top] : [yRange.lower, yRange.upper]}
        />
      )
    case table === 'Localization probabilities':
      return (
        <YAxis
          label={<YAxisLabel value={axisLabel} />}
          allowDataOverflow
          tick={renderYTick}
          interval={0}
          dataKey="value"
          type="number"
          domain={yAxisState.bottom ? [yAxisState.bottom, yAxisState.top] : [0, 100]}
        />
      )
    case !isEmpty(enumMapping[table]):
      return (
        <YAxis
          allowDataOverflow
          tick={renderYTick}
          interval={0}
          ticks={ticks}
          dataKey="value"
          type="number"
          domain={yAxisState.bottom ? [yAxisState.bottom, yAxisState.top] : [dataMin => dataMin - 1, dataMax => dataMax + 1]}
        />
      )
    default:
      return (
        <YAxis
          label={<YAxisLabel value={axisLabel} />}
          allowDataOverflow
          tick={renderYTick}
          interval={0}
          dataKey="value"
          type="number"
          domain={yAxisState.bottom ? [yAxisState.bottom, yAxisState.top] : [dataMin => dataMin < 0 ? dataMin * 1.15 : 0, dataMax => dataMax * 1.15 + 5]}
        />
      )
  }
}

const Entry = memo(({
  technology, feature, dataKey, zoom, zoomState, data, filters, yRange, enumMapping, isSession
}) => {
  const [table, axisLabel] = dataKey.split('&')
  const [yAxisState, setYAxisState] = useState({
    top: '',
    bottom: ''
  })
  const [localZoomState, setLocalZoomState] = useState({
    refLeft: '',
    refRight: '',
    refTop: '',
    refBottom: ''
  })
  const [height, setHeight] = useState(300)

  useEffect(() => {
    setHeight(table === "L5 State" ? 450 : 300)
    if (zoomState.selectedPlot === table) {
      setYAxisState({
        top: zoomState.top,
        bottom: zoomState.bottom
      })
    } else if (!zoomState.selectedPlot) {
      setYAxisState({
        top: '',
        bottom: ''
      })
    }
  }, [zoomState, table])

  const handleMouseDown = (e, table) => {
    const leftValue = e.xValue
    const topValue = e.yValue
    setLocalZoomState(prevState => ({
      ...prevState,
      refLeft: leftValue,
      refTop: topValue
    }))
  }

  const handleMouseMove = (e) => {
    if (localZoomState.refLeft && localZoomState.refTop) {
      const rightValue = e.xValue
      const bottomValue = e.yValue
      setLocalZoomState(prevState => ({
        ...prevState,
        refBottom: bottomValue,
        refRight: rightValue
      }))
    }
  }

  const handleMouseUp = async (e) => {
    let { refLeft, refRight, refTop, refBottom } = localZoomState
    if (refLeft > refRight) {
      [refLeft, refRight] = [refRight, refLeft]
    }
    if (refBottom > refTop) {
      [refTop, refBottom] = [refBottom, refTop]
    }
    zoom(refLeft, refRight, refTop, refBottom, table)
    setLocalZoomState({
      refLeft: '',
      refRight: '',
      refTop: '',
      refBottom: ''
    })
  }

  return (
    <ResponsiveContainer width="90%" height={height}>
      <ScatterChart
        margin={{
          top: 10, right: 100, left: 100, bottom: 30,
        }}
        onMouseDown={(e) => handleMouseDown(e, table)}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <ZAxis range={[40, 40]} />
        <XAxis allowDataOverflow tick={props => renderXTick(props, technology, feature)} type="number" dataKey="time" domain={[zoomState.left, zoomState.right]} />
        {getYAxis(table, yAxisState, axisLabel, yRange, enumMapping)}
        <Tooltip content={props => renderTooltip(props, technology, feature, axisLabel, enumMapping[table])} isAnimationActive={false} />
        {getScatter(data, dataKey, table, filters, enumMapping, isSession)}
        {(localZoomState.refLeft
          && localZoomState.refRight
          && localZoomState.refTop
          && localZoomState.refBottom
        ) ? (
          <ReferenceArea
            x1={localZoomState.refLeft}
            y1={localZoomState.refTop}
            x2={localZoomState.refRight}
            y2={localZoomState.refBottom}
            strokeOpacity={0.3}
          />
          ) : null
        }
      </ScatterChart>
    </ResponsiveContainer>
  )
})


const TimeSeriesPlot = ({ archives, technology, feature, reportType = PERFORMANCE, loadedData, queryString }) => {
  const archiveIds = archives.map(archive => archive.id)
  const { tableName, columns } = getTableInfo(technology, feature, reportType)
  const [filters, setFilters] = useState({
    sessions: []
  })
  const [yRange, setYRange] = useState({
    lower: DEFAULT_LOWER_BOUND,
    upper: DEFAULT_UPPER_BOUND
  })
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, !loadedData ? tableName : '', columns, [], false, false, queryString)
  const [plotState, setPlotState] = useState({ isProcessing: true })
  const [zoomState, setZoomState] = useState({
    minLeft: '',
    maxRight: '',
    left: 'dataMin',
    right: 'dataMax',
    top: 'dataMax+1',
    bottom: 'dataMin-1',
    selectedPlot: ''
  })
  const { errorMessage } = archivesInfo
  const { noSessionData, sessionData, sessionColors, enumMapping, isProcessing } = plotState

  useEffect(() => {
    if (!isLoading && (!errorMessage || loadedData)) {
      const [
        newNoSessionData,
        newSessionData,
        minTime,
        maxTime,
        newSessionColors,
        newEnumMapping
      ] = getTimeSeriesData(loadedData || archivesInfo, technology, feature, columns)
      const range = maxTime - minTime
      setPlotState(prevState => ({
        ...prevState,
        noSessionData: newNoSessionData,
        sessionData: newSessionData,
        sessionColors: newSessionColors,
        enumMapping: newEnumMapping,
        isProcessing: false
      }))
      setFilters({
        sessions: _.map(newSessionColors, (sessionColor, sessionName) => sessionName)
      })
      setZoomState(prevState => ({
        ...prevState,
        minLeft: minTime,
        maxRight: maxTime,
        left: minTime - range / 10,
        right: maxTime + range / 10
      }))
    }
  }, [isLoading, archivesInfo, loadedData])

  const zoom = (refLeft, refRight, refTop, refBottom, selectedPlot) => {
    if (refLeft === refRight || refRight === '' || refTop === refBottom || refBottom === '') {
      return
    }

    setZoomState(prevState => ({
      ...prevState,
      left: refLeft,
      right: refRight,
      top: refTop,
      bottom: refBottom,
      selectedPlot
    }))
  }

  const handleReset = () => {
    setZoomState((prevState) => {
      const range = prevState.maxRight - prevState.minLeft
      return {
        ...prevState,
        left: prevState.minLeft - range / 10,
        right: prevState.maxRight + range / 10,
        top: 'dataMax+1',
        bottom: 'dataMin-1',
        selectedPlot: ''
      }
    })
  }

  const handleCheck = (session) => {
    setFilters((prevState) => {
      const { sessions: prevSessions } = prevState
      const newSessions = filterToggle(prevSessions, session)
      return {
        sessions: newSessions
      }
    })
  }

  console.log('Rendering TimeSeriesPlot')
  return (
    <div style={{ padding: '50px' }}>
      {((errorMessage && !loadedData) || (!isProcessing && isEmpty(sessionData) && isEmpty(noSessionData)))
        && <ErrorMessage />}
      {!isProcessing && (
        <>
          {!isEmpty(noSessionData) && (
            <Row>
              <Col>
                {_.map(noSessionData, (dataPoints, dataKey) => (
                  <div key={dataKey}>
                    <Row className="justify-content-center">
                      {dataKey.split('&')[0]}
                    </Row>
                    <Row className="justify-content-center">
                      <Button variant="primary" onClick={handleReset}>Reset</Button>
                      <Entry
                        key={dataKey}
                        technology={technology}
                        feature={feature}
                        dataKey={dataKey}
                        zoom={zoom}
                        zoomState={zoomState}
                        data={dataPoints}
                        enumMapping={enumMapping}
                        isSession={false}
                      />
                    </Row>
                  </div>
                ))}
              </Col>
            </Row>
          )}
          {!isEmpty(sessionData) && (
            <>
              <Row style={{ marginTop: '50px' }}>
                <Col>
                  {_.map(sessionData, (dataPoints, dataKey) => {
                    const [table] = dataKey.split('&')
                    return (
                      <div key={dataKey}>
                        <Row className="justify-content-center">
                          {table}
                        </Row>
                        {table === 'Location to Fence' && (
                          <Row className="justify-content-center" style={{ margin: '15px' }}>
                            <span>Default Y-Axis Range: </span>
                            <RangeSelect range={yRange} setRange={setYRange} />
                          </Row>
                        )}
                        <Row className="justify-content-center">
                          <Button variant="primary" onClick={handleReset}>Reset</Button>
                          <Entry
                            technology={technology}
                            feature={feature}
                            dataKey={dataKey}
                            zoom={zoom}
                            zoomState={zoomState}
                            data={dataPoints}
                            filters={filters}
                            yRange={yRange}
                            enumMapping={enumMapping}
                            isSession
                          />
                        </Row>
                      </div>
                    )
                  })
                }
                </Col>
              </Row>
              <Row style={{ marginBottom: '10px' }}>
                <Col sm="1" style={{ minWidth: '125px' }}>
                  <Button variant="default" onClick={() => setFilters({ sessions: Object.keys(sessionColors) })}>Select All</Button>
                </Col>
                <Col sm="1" style={{ minWidth: '125px' }}>
                  <Button variant="default" onClick={() => setFilters({ sessions: [] })}>Remove All</Button>
                </Col>
              </Row>
              <Row className="justify-content-center">
                <Col>
                  <FilterTable
                    items={Object.keys(sessionColors).slice(0, Math.ceil(size(sessionColors) / 2))}
                    colors={Object.values(sessionColors).slice(0, Math.ceil(size(sessionColors) / 2))}
                    filter={filters.sessions}
                    handleCheck={handleCheck}
                  />
                </Col>
                <Col>
                  <FilterTable
                    items={Object.keys(sessionColors).slice(Math.ceil(size(sessionColors) / 2))}
                    colors={Object.values(sessionColors).slice(Math.ceil(size(sessionColors) / 2))}
                    filter={filters.sessions}
                    handleCheck={handleCheck}
                  />
                </Col>
              </Row>
            </>
          )}
        </>
      )}
      <Spinner visible={isProcessing && !errorMessage} />
    </div>
  )
}

export default React.memo(TimeSeriesPlot)
