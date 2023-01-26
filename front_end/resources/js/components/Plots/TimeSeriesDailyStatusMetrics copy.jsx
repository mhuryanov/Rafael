import React, { Suspense, lazy, useEffect, useState, memo, createRef } from "react"
import { Row, Col } from "react-bootstrap"
import { StatePanel } from "@dx/continuum-state-panel"
import { Spinner } from "@tidbits/react-tidbits/Spinner"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Legend,
  Line,
} from "recharts"
import { Button } from "@dx/continuum-button"
import TableModal from "../Widgets/TableModal"
import { SelectDropdown } from "@dx/continuum-select-dropdown"
import { useFetchArchiveData } from "../../hooks/fetchData"
import {
  KPI_TABLE,
  ARCHIVE_REPORTING_LOGS,
  CTP_LEVEL3_TABLE,
  L5_EVENTPLOT_TABLE,
  PLOT_TABLE,
  PERFORMANCE,
} from "../../utilities/constants"
import { size, isEmpty, filterToggle, addToObject, setDefaultObject, formatDateStamp } from "../../utilities/helpers"

const shortid = require("shortid")
const _ = require("underscore")

const DEFAULT_LOWER_BOUND = -2000
const DEFAULT_UPPER_BOUND = 20000

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

export const getTimeSeriesData = (archivesInfo, columns) => {
  const [
    timeStampCol,
    tableNameCol,
    sessionNameCol,
    labelCol,
    doubleValueCol,
    enumValueCol,
    descriptionCol,
    colorCol,
  ] = columns
  let noSessionData = {}
  let sessionData = {}
  let minTime
  let maxTime

  let metricOptions = []
  let dbOptions = []
  let trainOptions = []

  _.each(archivesInfo, (archiveData, archiveId) => {
    if (!isEmpty(archiveData)) {
      const metric_values = archiveData["metric_value"] || []
      const metric_bm_values = archiveData["metric_bm_value"] || []
      const metric_threshold_values = archiveData["metric_threshold_value"] || []

      const tableNames = archiveData[tableNameCol]
      const timeStamps = archiveData[timeStampCol]
      const labels = archiveData[labelCol]
      const enumValues = archiveData[enumValueCol] || archiveData[tableNameCol]?.map(() => "")
      const descriptions = descriptionCol ? archiveData[descriptionCol] : []

      metric_values?.forEach((session, i) => {
        if (!metricOptions.includes(archiveData?.metric_name[i])) {
          metricOptions.push(archiveData?.metric_name[i]);
        }

        if (!dbOptions.includes(archiveData?.db_name[i])) {
          dbOptions.push(archiveData?.db_name[i])
        }

        if (!trainOptions.includes(archiveData?.train_name[i])) {
          trainOptions.push(archiveData?.train_name[i])
        }

        const table = tableNames[i]
        const metric_value = session
        const metric_bm_value = metric_bm_values[i]
        const metric_threshold_value = metric_threshold_values[i]
        const time = new Date(timeStamps[i]).toISOString().slice(0, 10)
        const label = labels[i]
        const dataKey = `${table}&${label}`
        const enumValue = enumValues[i]
        const description = descriptions[i] || "null"
        const info = description !== "null" ? description : null

        const dataPoint = {
          time,
          metric_value: metric_value,
          metric_bm_value: metric_bm_value,
          metric_threshold_value: metric_threshold_value,
          metric_name: archiveData?.metric_name[i],
          db_name: archiveData?.db_name[i],
          train_name: archiveData?.train_name[i],
          description: { info },
        }

        if (session === null) {
          setDefaultObject(noSessionData, dataKey)
          addToObject(noSessionData[dataKey], enumValue, [dataPoint])
        } else {
          setDefaultObject(sessionData, dataKey)
          dataPoint.description.session = session
          addToObject(sessionData[dataKey], dataKey, [dataPoint])
        }
      })
    }
  })

  return [noSessionData, sessionData, minTime, maxTime, metricOptions, dbOptions, trainOptions]
}

const RenderTooltip = ({active, payload, label}) => {
  if (active && Array.isArray(payload) && payload.length > 0) {
    const { time, description, metric_value, metric_bm_value, metric_threshold_value } = payload[0].payload
    const { info } = description
    return (
      <div className="custom-tooltip box">
        <div>{`Date: ${time}`}</div>
        {info && <div className="description-info">{`Description: ${info}`}</div>}
        <div>{`Metric Value: ${metric_value}`}</div>
        <div>{`Metric Bm Value: ${metric_bm_value}`}</div>
        <div>{`Metric Threshold Value: ${metric_threshold_value}`}</div>
      </div>
    )
  }
  return null
}

const Entry = memo(({ feature, dataKey, zoom, zoomState, data, archiveData, metricName, dbName, trainName }) => {
  const [height, setHeight] = useState(300)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filteredArchiveData, setFilteredArchiveData] = useState(archiveData)
  const [filterData, setFilterData] = useState(data[dataKey])
  const [table, axisLabel] = dataKey.split('&')
  const [localZoomState, setLocalZoomState] = useState({
  refLeft: '',
  refRight: '',
  refTop: '',
  refBottom: ''
})

  useEffect(() => {
    let filterArr = [];
    data[dataKey].forEach(element => {
      if (element?.metric_name === metricName && element?.db_name === dbName && element?.train_name === trainName) {
        filterArr.push(element);
      }
    })
    setFilterData(filterArr);
  }, [metricName, dbName, trainName]);


  const handleMouseUp = async (e) => {
    // if (technology === 'REPLAY' && feature === 'MICROLOCATION') {
      const filteredData = parseAndFilterMicrolocation(archiveData, table)
      setFilteredArchiveData(filteredData)
      setIsModalOpen(true)
    let { refLeft, refRight, refTop, refBottom } = localZoomState
    if (refLeft > refRight) {
      [refLeft, refRight] = [refRight, refLeft]
    }
    if (refBottom > refTop) {
      [refTop, refBottom] = [refBottom, refTop]
    }
    //zoom(refLeft, refRight, refTop, refBottom, table)
    setLocalZoomState({
      refLeft: '',
      refRight: '',
      refTop: '',
      refBottom: ''
    })
  }

  return (
    <>
      <ResponsiveContainer width="90%" height={height}>
        <LineChart
          margin={{
            top: 10,
            right: 50,
            left: 1,
            bottom: 30,
          }}
          data={filterData}
        >
          <CartesianGrid strokeDasharray="8 4" />
          <Tooltip content={<RenderTooltip />}/>
          <XAxis dataKey="time" />
          <YAxis />
          <Legend />
          <Line type="monotone" dataKey="metric_value" stroke="#6BE646" strokeWidth="3" />
          <Line type="monotone" dataKey="metric_bm_value" stroke="#8080F7" strokeWidth="3" strokeDasharray="5 5" />
          <Line type="monotone" dataKey="metric_threshold_value" stroke="#ED8482" strokeWidth="3" strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
      <TableModal
        isOpen={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        data={filteredArchiveData}
        errorType={feature}
      />
    </>
  )
})

const parseAndFilterMicrolocation = (results, table) => {
  const output = []
  let i = 0
  for (const property in results) {
    results[property].forEach((item, index) => {
      if (!output[index]) {
        output[index] = {}
      }
      if (property === 'date') {
        item = item.split('T').join(' ').split('.')[0]
      }
      output[index][property] = item
    })
    i++
  }
  return output.filter(e => e.tech_config == table)
  // console.log("table", table)
}

const FilterOptions = ({
  metricName,
  dbName,
  trainName,
  setMetricName,
  setDbName,
  setTrainName,
  metricOptions,
  dbOptions,
  trainOptions,
}) => {
  return (
      <Row>
        <Col lg="4" md="3" sm="1">
          <div>Metric Name</div>
          <SelectDropdown
            value={metricName && { label: metricName, value: metricName }}
            placeholder="Select Metric Name..."
            onChange={(option) => setMetricName(option?.value)}
            options={metricOptions.map((metricItem) => ({ label: metricItem, value: metricItem }))}
          />
        </Col>
        <Col lg="4" md="3" sm="1">
          <div>DB Name</div>
          <SelectDropdown
            value={dbName && { label: dbName, value: dbName }}
            placeholder="Select DB Name..."
            onChange={(option) => setDbName(option?.value)}
            options={dbOptions.map((dbItem) => ({ label: dbItem, value: dbItem }))}
          />
        </Col>
        <Col lg="4" md="3" sm="1">
          <div>Train Name</div>
          <SelectDropdown
            value={trainName && { label: trainName, value: trainName }}
            placeholder="Select Train Name..."
            onChange={(option) => setTrainName(option?.value)}
            options={trainOptions.map((trainItem) => ({ label: trainItem, value: trainItem }))}
          />
        </Col>
      </Row>
  )
}

//reportType change to another instead of Performance
const TimeSeriesDailyStatusMetrics = ({
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
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, !loadedData ? tableName : '', columns)
  const { errorMessage } = archivesInfo
  const [plotState, setPlotState] = useState({ isProcessing: true })
  const { noSessionData, sessionData, sessionColors, enumMapping, isProcessing } = plotState
  const [metricName, setMetricName] = useState("test_purity")
  const [dbName, setDbName] = useState("Average")
  const [trainName, setTrainName] = useState("Sydney")
  const [metricOptions, setMetricOptions] = useState([])
  const [dbOptions, setDbOptions] = useState([])
  const [trainOptions, setTrainOptions] = useState([])

  useEffect(() => {
    if (!isLoading && (!errorMessage || loadedData)) {
      const [
        newNoSessionData,
        newSessionData,
        minTime,
        maxTime,
        metricOptions,
        dbOptions,
        trainOptions,
      ] = getTimeSeriesData(loadedData || archivesInfo, columns)

      setMetricOptions(metricOptions)
      setDbOptions(dbOptions)
      setTrainOptions(trainOptions)

      setPlotState((prevState) => ({
        ...prevState,
        noSessionData: newNoSessionData,
        sessionData: newSessionData,
        isProcessing: false,
      }))
    }
  }, [isLoading, archivesInfo, loadedData])

  const handleReset = () => {}

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
      {((errorMessage && !loadedData) || (!isProcessing && isEmpty(sessionData) && isEmpty(noSessionData)))
        && <ErrorMessage />}
      {!isProcessing && (
        <>
          {!isEmpty(noSessionData) && (
            <Row>
              <Col>
                {_.map(noSessionData, (dataPoints, dataKey) => (
                  <div key={dataKey}>
                    <Row className="">{dataKey.split("&")[0]}</Row>
                    <Row className="justify-content-center">
                      {technology !== "REPLAY" && feature !== "MICROLOCATION" && (
                        <Button variant="primary" onClick={handleReset}>
                          Reset
                        </Button>
                      )}
                      <Entry
                        key={dataKey}
                        dataKey={dataKey}
                        data={dataPoints}
                        metricName={metricName}
                        dbName={dbName}
                        trainName={trainName}
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
              <FilterOptions
                metricName={metricName}
                dbName={dbName}
                trainName={trainName}
                setMetricName={setMetricName}
                setDbName={setDbName}
                setTrainName={setTrainName}
                metricOptions={metricOptions}
                dbOptions={dbOptions}
                trainOptions={trainOptions}
              />
              <Row style={{ marginTop: "50px" }}>
                <Col>
                  {_.map(sessionData, (dataPoints, dataKey) => {
                    const [table] = dataKey.split("&")
                    return (
                      <div key={dataKey}>
                        <Row className="justify-content-center font-weight-bold">{table}</Row>
                        <Row className="justify-content-center">
                          {technology !== "REPLAY" && feature !== "MICROLOCATION" && (
                            <Button variant="primary" onClick={handleReset}>
                              Reset
                            </Button>
                          )}
                          <Entry
                            dataKey={dataKey}
                            data={dataPoints}
                            filters={filters}
                            yRange={yRange}
                            enumMapping={enumMapping}
                            metricName={metricName}
                            dbName={dbName}
                            trainName={trainName}
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
            </>
          )}
        </>
      )}
      <Spinner visible={isProcessing} />
    </div>
  )
}

export default React.memo(TimeSeriesDailyStatusMetrics)
