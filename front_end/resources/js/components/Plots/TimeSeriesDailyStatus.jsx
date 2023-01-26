import { Button } from "@dx/continuum-button"
import { StatePanel } from "@dx/continuum-state-panel"
import { Spinner } from "@tidbits/react-tidbits/Spinner"
import React, { memo, useEffect, useState } from "react"
import { Col, Row } from "react-bootstrap"
import { useHistory } from "react-router-dom"
import {
  CartesianGrid,
  Label,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"
import { useFetchArchiveData } from "../../hooks/fetchData"
import {
  ARCHIVE_REPORTING_LOGS,
  COLOR_ARRAY,
  CTP_LEVEL3_TABLE,
  KPI_TABLE,
  L5_EVENTPLOT_TABLE,
  PERFORMANCE,
  PLOT_TABLE,
} from "../../utilities/constants"
import { addToObject, filterToggle, formatDateStamp, isEmpty, setDefaultObject, size } from "../../utilities/helpers"
import FilterTable from "../Tables/FilterTable"
import TableModal from "../Widgets/TableModal"

const shortid = require("shortid")
const _ = require("underscore")

const DEFAULT_LOWER_BOUND = -2000
const DEFAULT_UPPER_BOUND = 20000

const tableOrder = {
  GNSS: {
    TTFF: [
      "Assistance&",
      "Gpssa Horizontal Error&Horizontal Error",
      "Gpssa Vertical Error&Vertical Error",
      "ClPos Horizontal Error&Horizontal Error",
      "ClPos Vertical Error&Vertical Error",
      "Wifi Horizontal Error&Horizontal Error",
      "Gpssa TTF&TTF",
      "ClPos TTF&TTF",
      "Wifi TTF&TTF",
    ],
  },
  CLX: {
    TRENDS: [
      "centroid_error&centroid_error",
      "wifi_error&wifi_error",
      "harvest&harvest",
      "cell_wifi&cell_wifi",
      "harvest_build_stats&harvest_build_stats",
    ],
    CHEESECAKE: [
      "PlayReliability",
      "ScanReliability",
    ],
  },
  REPLAY: {
    MICROLOCATION: [
      "WiFiOnly&Unsupervised",
      "WiFiBLE&Unsupervised",
      "AllTechs&Unsupervised",
      "WiFiOnly&Semisupervised",
      "WiFiBLE&Semisupervised",
      "AllTechs&Semisupervised",
    ],
  },
}

const ErrorMessage = () => (
  <div className="cdf-error">
    <StatePanel message="Error- could not find time series data." suggestion="Data may still be processing." />
  </div>
)

const getTableInfo = (technology, feature, reportType) => {
  if (technology === "REPLAY" && feature === "MICROLOCATION") {
    reportType === "Performance" ? KPI_TABLE[technology][feature] : PLOT_TABLE[technology][feature]
  }

  switch (true) {
    case reportType === "CTP":
      return { ...CTP_LEVEL3_TABLE, tableName: `r_${technology.toLowerCase()}_${feature.toLowerCase()}_ctp_level3` }
    case reportType === "L5":
      return {
        ...L5_EVENTPLOT_TABLE,
        tableName: `r_${technology.toLowerCase()}_${feature.toLowerCase()}_l5_state_plot`,
      }
    default:
      return KPI_TABLE[technology][feature]
  }
}

const sortData = (noSessionData, sessionData, technology, feature) => {
  if ((technology === "REPLAY" && feature === "MICROLOCATION") || (technology === "CLX" && feature === "TRENDS") || (technology === "CLX" && feature === "CHEESECAKE")) {
    const newSessionData = {}
    tableOrder[technology][feature].forEach((dataKey) => {
      if (sessionData[dataKey]) newSessionData[dataKey] = sessionData[dataKey]
    })
    if (!isEmpty(newSessionData)) {
      return [noSessionData, newSessionData]
    } else {
      return [noSessionData, sessionData]
    }
  }
}

export const getTimeSeriesData = (archivesInfo, technology, feature, columns) => {
  const [timeStampCol, tableNameCol, sessionNameCol, labelCol, doubleValueCol, enumValueCol, descriptionCol, colorCol] =
    columns

  const noSessionData = {}
  const sessionData = {}
  const sessionColors = {}
  const enumMapping = {}
  let colorIndex = 0
  let minTime
  let maxTime

  _.each(archivesInfo, (archiveData, archiveId) => {
    if (!isEmpty(archiveData)) {
      const sessionNames = archiveData[sessionNameCol] || archiveData[tableNameCol]?.map(() => "")
      const tableNames = archiveData[tableNameCol]
      const doubleValues = archiveData[doubleValueCol]
      const timeStamps = archiveData[timeStampCol] || archiveData['test_date']
      const labels = archiveData[labelCol]
      const enumValues = archiveData[enumValueCol] || archiveData[tableNameCol]?.map(() => "")
      const descriptions = descriptionCol ? archiveData[descriptionCol] : []
      const colors = colorCol ? archiveData[colorCol] : []
      sessionNames?.forEach((session, i) => {
        const table = tableNames[i]
        const value = doubleValues[i]
        const time = formatDateStamp(timeStamps[i])
        const label = labels[i]
        const dataKey = `${table}&${label}`
        const enumValue = enumValues[i]
        const description = descriptions[i] || "null"
        const color = colors[i] || "null"
        const info = description !== "null" ? description : null
        minTime = minTime ? Math.min(minTime, time) : time
        maxTime = maxTime ? Math.max(maxTime, time) : time
        const dataPoint = {
          time,
          value,
          description: { info },
        }
        setDefaultObject(enumMapping, table)
        if (enumValue && enumValue !== "null") enumMapping[table][value] = enumValue
        if (session.replace(/ /g, "") === "" || session === "null") {
          if (enumMapping[table][value]) {
            setDefaultObject(noSessionData, dataKey)
            addToObject(noSessionData[dataKey], enumValue, [dataPoint])
          } else {
            addToObject(noSessionData, dataKey, [dataPoint])
          }
        } else {
          setDefaultObject(sessionData, dataKey)
          if (!(session in sessionColors)) {
            if (color !== "null") {
              sessionColors[session] = color === "green" ? "lightgreen" : color
            } else {
              sessionColors[session] = COLOR_ARRAY[colorIndex]
              colorIndex += 1
            }
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
  const { x, height } = viewBox
  return (
    <text fontSize="small" transform={`translate(${x}, ${Math.floor((height * 2) / 3)}) rotate(-90)`}>
      {value}
    </text>
  )
}

const renderXTick = ({ x, y, payload }, technology, feature) => {
  const { value } = payload
  let xTick = new Date(value * 8.64e7).toISOString().slice(0, 10)
  return (
    <text fontSize="medium" fontWeight="bold" x={x} y={y + 10} textAnchor="middle">
      {xTick}
    </text>
  )
}

const renderEnumYTick = ({ x, y, payload }, enumMapping) => {
  const { value } = payload
  return (
    <text fontSize="medium" fontWeight="bold" x={x - 50} y={y + 5} textAnchor="middle">
      {enumMapping[value]}
    </text>
  )
}

const renderNumberYTick = ({ x, y, payload }) => {
  const { value } = payload
  const expoValue = Number.parseFloat(value).toExponential(2)
  return (
    <text fontSize="medium" fontWeight="bold" x={x - 30} y={y + 5} textAnchor="middle">
      {expoValue}
    </text>
  )
}

const renderTooltip = ({ active, payload }, technology, feature, label, enumValue) => {
  if (active && Array.isArray(payload) && payload.length > 0) {
    const { time, value, description } = payload[0].payload
    const { session, info } = description
    let timeStamp
    let valueToShow = value
    switch (true) {
      case technology === "GNSS" && feature === "TTFF":
        timeStamp = time
        break
      default:
        timeStamp = new Date(time * 8.64e7).toISOString().slice(0, 10)
    }
    if (!isEmpty(enumValue)) {
      valueToShow = enumValue[value]
    }
    return (
      <div className="custom-tooltip box">
        <div>{`Date: ${timeStamp}`}</div>
        {info && <div className="description-info">{info}</div>}
      </div>
    )
  }
  return null
}

const getScatter = (data, dataKey, table, filters, enumMapping, isSession, clickFunc) => {
  switch (true) {
    case isSession && isEmpty(enumMapping[table]):
      return Object.keys(data)
        .filter((session) => {
          const [sessionName] = session.split("&")
          return filters.sessions.includes(sessionName)
        })
        .map((session) => {
          const [sessionName, sessionColor] = session.split("&")
          return (
            <Scatter
              line
              key={dataKey + sessionName}
              isAnimationActive={false}
              fill={sessionColor}
              data={data[session]}
              name={sessionName}
            />
          )
        })
    case isSession && !isEmpty(enumMapping[table]):
      return Object.keys(data)
        .filter((session) => {
          const [sessionName] = session.split("&")
          return filters.sessions.includes(sessionName)
        })
        .map((session) => {
          const [sessionName, sessionColor] = session.split("&")
          const getDataPoints = () => {
            return data[session]
          }
          const dataPoints = getDataPoints()
          return (
            <Scatter
              line={false}
              lineJointType={undefined}
              key={dataKey + sessionName}
              isAnimationActive={false}
              fill={sessionColor}
              stroke={sessionColor}
              strokeWidth={4}
              data={dataPoints}
              name={sessionName}
              onClick={(item, i, e) => {
                e.persist()
                clickFunc(item, e, dataKey)
              }}
            />
          )
        })
    default:
      return (
        <Scatter
          line={false}
          lineJointType={undefined}
          key={dataKey + sessionName}
          isAnimationActive={false}
          fill={sessionColor}
          data={dataPoints}
          name={sessionName}
          onClick={(item, i, e) => {
            e.persist()
            clickFunc(item, e, dataKey)
          }}
        />
      )
  }
}

const getYAxis = (table, yAxisState, axisLabel, yRange, enumMapping) => {
  const renderYTick = (props) =>
    !isEmpty(enumMapping[table]) ? renderEnumYTick(props, enumMapping[table]) : renderNumberYTick(props)
  const ticks = !isEmpty(enumMapping[table]) ? Object.keys(enumMapping[table]) : []
  switch (true) {
    case !isEmpty(enumMapping[table]):
      return (
        <YAxis
          allowDataOverflow
          tick={renderYTick}
          interval={0}
          ticks={ticks}
          dataKey="value"
          type="number"
          domain={[(dataMin) => dataMin - 1, (dataMax) => dataMax + 1]}
          padding={{ bottom: 10 }}
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
          domain={[(dataMin) => dataMin * 0.9, (dataMax) => dataMax * 1.1]}
        />
      )
  }
}

const RightClickOptions = ["Open"]
export const getMenuItemStyle = (menuItem) => {
  const getMenuItemColor = () => {
    switch (menuItem) {
      case "Open":
        return "CadetBlue"
      default:
        return "grey"
    }
  }
  return { color: getMenuItemColor() }
}
export const getMenuIcon = (menuItem) => {
  switch (menuItem) {
    case "Open":
      return <>📂</>
    default:
      return <>⃜</>
  }
}

export const getMenuItems = (selectedItem) => {
  if (!selectedItem) {
    return []
  }
  return RightClickOptions
}

const Entry = memo(
  ({ technology, feature, dataKey, zoom, zoomState, data, filters, yRange, enumMapping, isSession, archiveData }) => {
    const history = useHistory()
    const [table, axisLabel] = dataKey.split("&")
    const [yAxisState, setYAxisState] = useState({
      top: "",
      bottom: "",
    })
    const [localZoomState, setLocalZoomState] = useState({
      refLeft: "",
      refRight: "",
      refTop: "",
      refBottom: "",
    })
    const [height, setHeight] = useState(300)
    const [clickArchive, setClickArchive] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filteredArchiveData, setFilteredArchiveData] = useState(archiveData)

    // special case for status plots in CLX Trends Reports
    const createReferenceArea = (data) => {
      let firstHalfAvg
      let secondHalfAvg
      let firstHalfRegex = /First Half Average: \d+.\d*/
      let secondHalfRegex = /Second Half Average: \d+.\d*/
      let numberRegex = /\d+.\d*/
      for (var sessionName in data) {
        const dataPoints = data[sessionName]
        const finalDescription = dataPoints[dataPoints.length - 1]["description"]["info"]
        if (finalDescription) {
          const firstHalfDescription = finalDescription.match(firstHalfRegex)
          const secondHalfDescription = finalDescription.match(secondHalfRegex)
          if (firstHalfDescription) {
            firstHalfAvg = parseFloat(firstHalfDescription[0].match(numberRegex))
          }
          if (secondHalfDescription) {
            secondHalfAvg = parseFloat(secondHalfDescription[0].match(numberRegex))
          }
        }
      }
      if (firstHalfAvg && secondHalfAvg) {
        return [
          <ReferenceArea
            alwaysShow={true}
            y1={firstHalfAvg * 0.75}
            y2={firstHalfAvg * 1.25}
            stroke="green"
            strokeOpacity={0.2}
            key={shortid.generate()}
            fill="green"
            fillOpacity="0.2"
          />,
          <ReferenceArea
            alwaysShow={true}
            y1={secondHalfAvg * 0.75}
            y2={secondHalfAvg * 1.25}
            stroke="blue"
            strokeOpacity={0.2}
            key={shortid.generate()}
            fill="blue"
            fillOpacity="0.2"
          />,
          <ReferenceLine
            key={shortid.generate()}
            y={firstHalfAvg}
            label={
              <Label
                value="first_half_avg"
                style={{ fill: "green", fontSize: "100%" }}
                offset={5}
                position="insideTopRight"
              />
            }
            stroke={"green"}
            strokeDasharray="3 3"
            alwaysShow={true}
          />,
          <ReferenceLine
            key={shortid.generate()}
            y={secondHalfAvg}
            label={
              <Label
                value="second_half_avg"
                style={{ fill: "blue", fontSize: "100%" }}
                offset={5}
                position="insideBottomLeft"
              />
            }
            stroke={"blue"}
            strokeDasharray="3 3"
            alwaysShow={true}
          />,
        ]
      } else {
        return <> </>
      }
    }

    useEffect(() => {
      setHeight(300)
      if (zoomState.selectedPlot === table) {
        setYAxisState({
          top: zoomState.top,
          bottom: zoomState.bottom,
        })
      } else if (!zoomState.selectedPlot) {
        setYAxisState({
          top: "",
          bottom: "",
        })
      }
    }, [zoomState, table])

    const handleClick = ({ time }, event, dataKey) => {
      let jobName = dataKey.split("&")[0]
      const dateStr = new Date(time * 8.64e7).toISOString().slice(0, 10)
      if (technology === "CLX") {
        const doRedirect = confirm(`Go to the report for job: ${jobName} and date: ${dateStr}?`)
        if (doRedirect)
          history.push(`/technology/${technology}/${feature}/report/${jobName}/${dateStr}`)
      } else {
        const doRedirect = confirm(`View all metrics data report`)
        if (doRedirect)
          history.push(`/technology/${technology}/${feature}/report/`)
      }
    }

    const handleMouseDown = (e, table) => {
      const leftValue = e.xValue
      const topValue = e.yValue
      setLocalZoomState((prevState) => ({
        ...prevState,
        refLeft: leftValue,
        refTop: topValue,
      }))
    }

    const handleMouseMove = (e) => {
      if (localZoomState.refLeft && localZoomState.refTop) {
        const rightValue = e.xValue
        const bottomValue = e.yValue
        setLocalZoomState((prevState) => ({
          ...prevState,
          refBottom: bottomValue,
          refRight: rightValue,
        }))
      }
    }

    const handleMouseUp = async (e) => {
      if (technology === "REPLAY" && feature === "MICROLOCATION") {
        const filteredData = parseAndFilterMicrolocation(archiveData, table)
        setFilteredArchiveData(filteredData)
        setIsModalOpen(true)
      }
      let { refLeft, refRight, refTop, refBottom } = localZoomState
      if (refLeft > refRight) {
        ;[refLeft, refRight] = [refRight, refLeft]
      }
      if (refBottom > refTop) {
        ;[refTop, refBottom] = [refBottom, refTop]
      }
      zoom(refLeft, refRight, refTop, refBottom, table)
      setLocalZoomState({
        refLeft: "",
        refRight: "",
        refTop: "",
        refBottom: "",
      })
    }

    return (
      <>
        <ResponsiveContainer width="90%" height={height}>
          <ScatterChart
            margin={{
              top: 10,
              right: 50,
              left: 50,
              bottom: 30,
            }}
            onMouseDown={(e) => handleMouseDown(e, table)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <ZAxis range={[40, 40]} />
            <XAxis
              allowDataOverflow
              tick={(props) => renderXTick(props, technology, feature)}
              type="number"
              dataKey="time"
              domain={[Math.floor(zoomState.left), Math.ceil(zoomState.right)]}
              allowDecimals={false}
            />
            {getYAxis(table, yAxisState, axisLabel, yRange, enumMapping)}
            <Tooltip
              content={(props) => renderTooltip(props, technology, feature, axisLabel, enumMapping[table])}
              isAnimationActive={false}
            />
            {createReferenceArea(data)}
            {getScatter(data, dataKey, table, filters, enumMapping, isSession, handleClick)}
            {localZoomState.refLeft && localZoomState.refRight && localZoomState.refTop && localZoomState.refBottom ? (
              <ReferenceArea
                x1={localZoomState.refLeft}
                y1={localZoomState.refTop}
                x2={localZoomState.refRight}
                y2={localZoomState.refBottom}
                strokeOpacity={0.3}
              />
            ) : null}
          </ScatterChart>
        </ResponsiveContainer>
        <TableModal
          isOpen={isModalOpen}
          handleClose={() => setIsModalOpen(false)}
          data={filteredArchiveData}
          errorType={feature}
        />
      </>
    )
  },
)

const parseAndFilterMicrolocation = (results, table) => {
  const output = []
  let i = 0
  for (const property in results) {
    results[property].forEach((item, index) => {
      if (!output[index]) {
        output[index] = {}
      }
      if (property === "date") {
        item = item.split("T").join(" ").split(".")[0]
      }
      output[index][property] = item
    })
    i++
  }
  return output.filter((e) => e.tech_config == table)
}

//reportType change to another instead of Performance
const TimeSeriesDailyStatus = ({
  archives,
  technology,
  feature,
  reportType = PERFORMANCE,
  loadedData,
  providedColumns,
}) => {
  const archiveIds = archives.map((archive) => archive.id)
  const { tableName, columns } = providedColumns ? providedColumns : getTableInfo(technology, feature, reportType)
  const [filters, setFilters] = useState({
    sessions: [],
  })
  const [yRange, setYRange] = useState({
    lower: DEFAULT_LOWER_BOUND,
    upper: DEFAULT_UPPER_BOUND,
  })
  const [isLoading, archivesInfo] = useFetchArchiveData(
    archiveIds,
    ARCHIVE_REPORTING_LOGS,
    !loadedData ? tableName : "",
    columns,
  )
  const [plotState, setPlotState] = useState({ isProcessing: true })
  const [zoomState, setZoomState] = useState({
    minLeft: "",
    maxRight: "",
    left: "dataMin",
    right: "dataMax",
    top: "dataMax+1",
    bottom: "dataMin-1",
    selectedPlot: "",
  })
  const { errorMessage } = archivesInfo
  const { noSessionData, sessionData, sessionColors, enumMapping, isProcessing } = plotState

  useEffect(() => {
    if (!isLoading && (!errorMessage || loadedData)) {
      const [newNoSessionData, newSessionData, minTime, maxTime, newSessionColors, newEnumMapping] = getTimeSeriesData(
        loadedData || archivesInfo,
        technology,
        feature,
        columns,
      )
      const range = maxTime - minTime
      setPlotState((prevState) => ({
        ...prevState,
        noSessionData: newNoSessionData,
        sessionData: newSessionData,
        sessionColors: newSessionColors,
        enumMapping: newEnumMapping,
        isProcessing: false,
      }))
      setFilters({
        sessions: _.map(newSessionColors, (sessionColor, sessionName) => sessionName),
      })
      setZoomState((prevState) => ({
        ...prevState,
        minLeft: minTime,
        maxRight: maxTime,
        left: minTime - range / 10,
        right: maxTime + range / 10,
      }))
    }
  }, [isLoading, archivesInfo, loadedData])

  const zoom = (refLeft, refRight, refTop, refBottom, selectedPlot) => {
    if (refLeft === refRight || refRight === "" || refTop === refBottom || refBottom === "") {
      return
    }

    setZoomState((prevState) => ({
      ...prevState,
      left: refLeft,
      right: refRight,
      top: refTop,
      bottom: refBottom,
      selectedPlot,
    }))
  }

  const handleReset = () => {
    setZoomState((prevState) => {
      const range = prevState.maxRight - prevState.minLeft
      return {
        ...prevState,
        left: prevState.minLeft - range / 10,
        right: prevState.maxRight + range / 10,
        top: "dataMax+1",
        bottom: "dataMin-1",
        selectedPlot: "",
      }
    })
  }

  const handleCheck = (session) => {
    setFilters((prevState) => {
      const { sessions: prevSessions } = prevState
      const newSessions = filterToggle(prevSessions, session)
      return {
        sessions: newSessions,
      }
    })
  }

  return (
    <div style={{ padding: "2px" }}>
      {((errorMessage && !loadedData) || (!isProcessing && isEmpty(sessionData) && isEmpty(noSessionData))) && (
        <ErrorMessage />
      )}
      {!isProcessing && (
        <>
          {!isEmpty(noSessionData) && (
            <Row>
              <Col>
                {_.map(noSessionData, (dataPoints, dataKey) => (
                  <div key={dataKey}>
                    <Row className="">{dataKey.split("&")[0]}</Row>
                    <Row className="justify-content-center">
                      <Button variant="primary" onClick={handleReset}>
                        Reset
                      </Button>
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
                        archiveData={loadedData[archives[0]]}
                      />
                    </Row>
                  </div>
                ))}
              </Col>
            </Row>
          )}
          {!isEmpty(sessionData) && (
            <>
              <Row style={{ marginTop: "50px" }}>
                <Col>
                  {_.map(sessionData, (dataPoints, dataKey) => {
                    const [table] = dataKey.split("&")
                    return (
                      <div key={dataKey}>
                        <Row className="justify-content-center font-weight-bold">{table}</Row>
                        <Row className="justify-content-center">
                          <Button variant="primary" onClick={handleReset}>
                            Reset
                          </Button>
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
                            archiveData={loadedData[archives[0]]}
                          />
                        </Row>
                      </div>
                    )
                  })}
                </Col>
              </Row>
              <Row style={{ marginBottom: "10px" }}>
                <Col sm="1" style={{ minWidth: "125px" }}>
                  <Button variant="default" onClick={() => setFilters({ sessions: Object.keys(sessionColors) })}>
                    Select All
                  </Button>
                </Col>
                <Col sm="1" style={{ minWidth: "125px" }}>
                  <Button variant="default" onClick={() => setFilters({ sessions: [] })}>
                    Remove All
                  </Button>
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

export default React.memo(TimeSeriesDailyStatus)
