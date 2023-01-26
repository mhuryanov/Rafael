import { Button } from "@dx/continuum-button"
import { SelectDropdown } from "@dx/continuum-select-dropdown"
import { StatePanel } from "@dx/continuum-state-panel"
import { Spinner } from "@tidbits/react-tidbits/Spinner"
import React, { memo, useEffect, useState } from "react"
import { Col, Row } from "react-bootstrap"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useFetchArchiveData } from "../../hooks/fetchData"
import {
  ARCHIVE_REPORTING_LOGS,
  CTP_LEVEL3_TABLE,
  KPI_TABLE,
  L5_EVENTPLOT_TABLE,
  PLOT_TABLE,
} from "../../utilities/constants"
import { addToObject, formatDateStamp, isEmpty, setDefaultObject } from "../../utilities/helpers"
import TableModal from "../Widgets/TableModal"

const shortid = require("shortid")
const _ = require("underscore")

const DEFAULT_LOWER_BOUND = -2000
const DEFAULT_UPPER_BOUND = 20000

const ErrorMessage = () => (
  <div className="cdf-error">
    <StatePanel message="Error- could not find time series data." suggestion="Data may still be processing." />
  </div>
)

// const getTableInfo = (technology, feature, reportType) => {
//   if (technology === "REPLAY" && feature === "MICROLOCATION") {
//     reportType === "Performance" ? KPI_TABLE[technology][feature] : PLOT_TABLE[technology][feature]
//   }

//   switch (true) {
//     case reportType === "CTP":
//       return { ...CTP_LEVEL3_TABLE, tableName: `r_${technology.toLowerCase()}_${feature.toLowerCase()}_ctp_level3` }
//     case reportType === "L5":
//       return {
//         ...L5_EVENTPLOT_TABLE,
//         tableName: `r_${technology.toLowerCase()}_${feature.toLowerCase()}_l5_state_plot`,
//       }
//     default:
//       return KPI_TABLE[technology][feature]
//   }
// }

export const getTimeSeriesData = (archivesInfo, columns) => {
  const [timeStampCol, tableNameCol, sessionNameCol, labelCol, doubleValueCol, enumValueCol, descriptionCol, colorCol] =
    columns
  let sessionData = {}
  let minTime
  let maxTime

  let metricOptions = []
  let dbOptions = []
  let trainOptions = []

  _.each(archivesInfo, (archiveData) => {
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
          metricOptions.push(archiveData?.metric_name[i])
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
        const time = formatDateStamp(timeStamps[i])
        const date = timeStamps[i].split('.')[0].replace('T', ' ');
        const label = labels[i]
        const dataKey = `${table}&${label}`
        const enumValue = enumValues[i]
        const description = descriptions[i] || "null"
        const info = description !== "null" ? description : null

        const dataPoint = {
          time,
          date,
          learning_mode: archiveData?.learning_mode[i] || null,
          tech_config: archiveData?.tech_config[i] || null,
          row_index: archiveData?.row_index[i] || null,
          bats_container: archiveData?.bats_container[i] || null,
          corelocation_git_sha: archiveData?.corelocation_git_sha[i] || null,
          bolt_task_id: archiveData?.bolt_task_id[i] || null,
          sw_ver: archiveData?.sw_ver[i] || null,
          microlocation_version: archiveData?.microlocation_version[i] || null,
          metric_value: metric_value,
          metric_bm_value: metric_bm_value,
          metric_threshold_value: metric_threshold_value,
          metric_name: archiveData?.metric_name[i],
          db_name: archiveData?.db_name[i],
          train_name: archiveData?.train_name[i],
          description: { info },
        }
        if (session != null) {
          setDefaultObject(sessionData, dataKey)
          dataPoint.description.session = session
          addToObject(sessionData[dataKey], dataKey, [dataPoint])
        }
      })
    }
  })

  return [sessionData, minTime, maxTime, metricOptions, dbOptions, trainOptions]
}

const renderXTick = ({ x, y, payload }) => {
  const { value } = payload
  let xTick = new Date(value * 8.64e7).toISOString().slice(0, 10)
  return (
    <text fontSize="medium" fontWeight="bold" x={x} y={y + 10} textAnchor="middle">
      {xTick}
    </text>
  )
}

const renderYTick = ({ x, y, payload }) => {
  const { value } = payload
  return (
    <text fontSize="medium" fontWeight="bold" x={x - 20} y={y + 5} textAnchor="middle">
      {Number(value).toFixed(2)}
    </text>
  )
}

const RenderTooltip = ({ active, payload }) => {
  if (active && Array.isArray(payload) && payload.length > 0) {
    const { time, description, metric_value, metric_bm_value, metric_threshold_value } = payload[0].payload
    const { info } = description
    const timeStamp = new Date(time * 8.64e7).toISOString().slice(0, 10)
    return (
      <div className="custom-tooltip box">
        <div>{`Date: ${timeStamp}`}</div>
        {info && <div className="description-info">{`Description: ${info}`}</div>}
        <div>{`Metric Value: ${metric_value}`}</div>
        <div>{`Metric Bm Value: ${metric_bm_value}`}</div>
        <div>{`Metric Threshold Value: ${metric_threshold_value}`}</div>
      </div>
    )
  }
  return null
}

const Entry = memo(({ dataKey, data, metricName, dbName, trainName }) => {
  const [height, setHeight] = useState(300)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filteredArchiveData, setFilteredArchiveData] = useState([])
  const [filterData, setFilterData] = useState(data[dataKey])

  const [zoomState, setZoomState] = useState({
    data: filterData,
    left: "dataMin",
    right: "dataMax",
    refAreaLeft: "",
    refAreaRight: "",
    animation: true,
  })

  useEffect(() => {
    let filterArr = []
    data[dataKey].forEach((element) => {
      if (element?.metric_name === metricName && element?.db_name === dbName && element?.train_name === trainName) {
        filterArr.push(element)
      }
    })
    setFilterData(filterArr)
    setZoomState((prevState) => ({
      ...prevState,
      data: filterArr,
    }))
  }, [metricName, dbName, trainName])

  const zoom = () => {
    let { refAreaLeft, refAreaRight } = zoomState
    const { data } = zoomState

    if (refAreaLeft === refAreaRight || refAreaRight === "") {
      setZoomState((prevState) => ({
        ...prevState,
        refAreaLeft: "",
        refAreaRight: "",
      }))
    } else {
      // xAxis domain
      if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft]

      setZoomState(() => ({
        refAreaLeft: "",
        refAreaRight: "",
        data: data.slice(),
        left: refAreaLeft,
        right: refAreaRight,
      }))
    }
  }

  const handleMouseUp = (e) => {
    const filteredData = parseAndFilterMicrolocation(data[dataKey], e?.activePayload[0]?.payload?.time, metricName)
    setFilteredArchiveData(filteredData)
    setIsModalOpen(true)
    zoom()
  }

  const handleReset = () => {
    const { data } = zoomState
    setZoomState((prevState) => ({
      ...prevState,
      data: data.slice(),
      refAreaLeft: "",
      refAreaRight: "",
      left: "dataMin",
      right: "dataMax",
    }))
  }
  const lineValues = [
    {
      type: "natural",
      yAxisId: "1",
      name: "Metric Value",
      dataKey: "metric_value",
      stroke: "#6BE646",
      strokeWidth: "3",
      strokeDasharray: "5 5"
    },
    {
      type: "natural",
      yAxisId: "1",
      name: "Benchmark Value",
      dataKey: "metric_bm_value",
      stroke: "#8080F7",
      strokeWidth: "3",
      strokeDasharray: "5 5"
    },
    {
      type: "natural",
      yAxisId: "1",
      name: "Threshold Value",
      dataKey: "metric_threshold_value",
      stroke: "#ED8482",
      strokeWidth: "3",
      strokeDasharray: "5 5"
    },
  ]

  return (
    <>
      <Button variant="primary" onClick={handleReset}>
        Reset
      </Button>
      <ResponsiveContainer width="90%" height={height}>
        <LineChart
          margin={{
            top: 10,
            right: 50,
            left: 1,
            bottom: 30,
          }}
          data={zoomState?.data}
          onMouseDown={(e) => {
            setZoomState((prevState) => ({ ...prevState, refAreaLeft: e?.activeLabel }))
          }}
          onMouseMove={(e) =>
            zoomState?.refAreaLeft && setZoomState((prevState) => ({ ...prevState, refAreaRight: e?.activeLabel }))
          }
          onMouseUp={handleMouseUp}
        >
          <CartesianGrid strokeDasharray="8 4" />
          <XAxis
            allowDataOverflow
            dataKey="time"
            tick={(props) => renderXTick(props)}
            domain={[zoomState?.left, zoomState?.right]}
            type="number"
          />
          <YAxis type="number" yAxisId="1" domain={['dataMin - 0.1', 'dataMax + 0.1']} padding={{ bottom: 10 }} tick={(props) => renderYTick(props)}/>
          <Tooltip content={<RenderTooltip />} isAnimationActive={false} />
          <Legend />
          {/* {lineValues.map((props) => <Line
            type="natural"
            yAxisId="1"
            name={props.name}
            dataKey={props.name}
            stroke="#8080F7"
            strokeWidth="3"
            strokeDasharray="5 5"
            />)} */}
          <Line type="natural" yAxisId="1" name="Metric Value" dataKey="metric_value" stroke="#6BE646" strokeWidth="3" />
          <Line
            type="natural"
            yAxisId="1"
            name="Benchmark Value"
            dataKey="metric_bm_value"
            stroke="#8080F7"
            strokeWidth="3"
            strokeDasharray="5 5"
          />
          <Line
            type="natural"
            yAxisId="1"
            name="Threshold Value"
            dataKey="metric_threshold_value"
            stroke="#ED8482"
            strokeWidth="3"
            strokeDasharray="5 5"
          />

          {zoomState?.refAreaLeft && zoomState?.refAreaRight ? (
            <ReferenceArea yAxisId="1" x1={zoomState?.refAreaLeft} x2={zoomState?.refAreaRight} strokeOpacity={0.3} />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
      <TableModal
        isOpen={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        data={filteredArchiveData}
        errorType="MICROLOCATION_DATA"
      />
    </>
  )
})

const parseAndFilterMicrolocation = (results, time, metricName) => {
  let output = []
  let i = 0
  results.forEach((element) => {
    if (element?.time == time && element?.metric_name == metricName) {
      for (const property in element) {
        if (!output[i]) {
          output[i] = {}
        }
        let item = element[property]
        output[i][property] = item
      }
      i++
    }
  })
  return output
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

const TimeSeriesDailyStatusMetrics = ({
  loadedData,
  options
}) => {
  // const { columns } = providedColumns ? providedColumns : getTableInfo(technology, feature, reportType)
  const [plotState, setPlotState] = useState({ isProcessing: true })
  const {sessionData, isProcessing } = plotState
  const [metricName, setMetricName] = useState("test_purity")
  const [dbName, setDbName] = useState("Average")
  const [trainName, setTrainName] = useState("Sydney")
  // const [metricOptions, setMetricOptions] = useState([])
  // const [dbOptions, setDbOptions] = useState([])
  // const [trainOptions, setTrainOptions] = useState([])


  // // useEffect(() => {
  // //   if (loadedData) {
  // //     const [newSessionData, minTime, maxTime, metricOptions, dbOptions, trainOptions] =
  // //       getTimeSeriesData(loadedData, columns)

  // //     setMetricOptions(metricOptions)
  // //     setDbOptions(dbOptions)
  // //     setTrainOptions(trainOptions)

  // //     setPlotState((prevState) => ({
  // //       ...prevState,
  // //       sessionData: loadedData,
  // //       isProcessing: false,
  // //     }))
  // //   }
  // // }, [loadedData])

  return (
    <div style={{ padding: "2px" }}>
      {(!loadedData || (!isProcessing && isEmpty(loadedData))) && (
        <ErrorMessage />
      )}
      {!isProcessing && (
        <>
          {!isEmpty(loadedData) && (
            <>
              <FilterOptions
                metricName={metricName}
                dbName={dbName}
                trainName={trainName}
                setMetricName={setMetricName}
                setDbName={setDbName}
                setTrainName={setTrainName}
                metricOptions={options?.metricOptions}
                dbOptions={options?.dbOptions}
                trainOptions={options?.trainOptions}
              />
              <Row style={{ marginTop: "50px" }}>
                <Col>
                  {_.map(loadedData, (dataPoints, dataKey) => {
                    const [table] = dataKey.split("&")
                    return (
                      <div key={dataKey}>
                        <Row className="justify-content-center font-weight-bold">{table}</Row>
                        <Row className="justify-content-center">
                          <Entry
                            dataKey={dataKey}
                            data={dataPoints}
                            metricName={metricName}
                            dbName={dbName}
                            trainName={trainName}
                          />
                        </Row>
                      </div>
                    )
                  })}
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
