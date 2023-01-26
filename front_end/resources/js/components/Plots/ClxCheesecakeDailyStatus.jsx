import { Button } from "@dx/continuum-button"
import { StatePanel } from "@dx/continuum-state-panel"
import { Spinner } from "@tidbits/react-tidbits/Spinner"
import { _ } from "core-js"
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
  Cell,
  Legend
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

let tag_items = ["AirTag", "Chipolo"];

const renderXTick = ({ x, y, payload }) => {
  const { value } = payload
  const xTick = new Date(value * 8.64e7).toISOString().slice(0, 10)
  return (
    <text fontSize="medium" fontWeight="bold" x={x} y={y + 10} textAnchor="middle">
      {xTick}
    </text>
  )
}

const renderYTick = ({ x, y, payload }) => {
  const { value } = payload
  return (
    <text fontSize="medium" fontWeight="bold" x={x - 30} y={y + 5} textAnchor="middle">
      {value}
    </text>
  )
}

const renderTooltip = ({ active, payload }) => {
    if (active && Array.isArray(payload) && payload.length > 0) {
      const { time, result, model } = payload[0].payload;
      let info = "";
      switch(result) {
        case 4:
          info = "Pass"
          break;
        case 3:
          info = "Pass with issue";
          break;
        case 2:
          info = "Fail"
          break;
      }
      return (
        <div className="custom-tooltip box">
          <div>{`Device/model: ${model}`}</div>
          <div className="description-info">{`Result: ${info}`}</div>
        </div>
      )
    }
    return null
}

const Entry = memo(
  ({ technology, feature, zoom, data, zoomState, yRange }) => {
    const history = useHistory()
    // const [table, axisLabel] = dataKey.split("&")
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
    // const [filteredArchiveData, setFilteredArchiveData] = useState(archiveData)


    useEffect(() => {
      setHeight(300)
      if (!zoomState.selectedPlot) {
        setYAxisState({
          top: "",
          bottom: "",
        })
      }
    }, [zoomState])

    const handleClick = ({ time }, event, dataKey) => {
      let jobName = dataKey.split("&")[0]
      const dateStr = new Date(time * 8.64e7).toISOString().slice(0, 10)
      // if (technology === "CLX") {
      //   const doRedirect = confirm(`Go to the report for job: ${jobName} and date: ${dateStr}?`)
      //   if (doRedirect)
      //     history.push(`/technology/${technology}/${feature}/report/${jobName}/${dateStr}`)
      // } else {
      //   const doRedirect = confirm(`View all metrics data report`)
      //   if (doRedirect)
      //     history.push(`/technology/${technology}/${feature}/report/`)
      // }
    }

    const handleMouseDown = (e) => {
      const leftValue = e?.xValue
      const topValue = e?.yValue
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
        // const filteredData = parseAndFilterMicrolocation(archiveData, table)
        // setFilteredArchiveData(filteredData)
        setIsModalOpen(true)
      }
      let { refLeft, refRight, refTop, refBottom } = localZoomState
      if (refLeft > refRight) {
        ;[refLeft, refRight] = [refRight, refLeft]
      }
      if (refBottom > refTop) {
        ;[refTop, refBottom] = [refBottom, refTop]
      }
      zoom(refLeft, refRight, refTop, refBottom)
      setLocalZoomState({
        refLeft: "",
        refRight: "",
        refTop: "",
        refBottom: "",
      })
    }

    console.log("plot data", data);

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
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <ZAxis range={[40, 40]} />
            <XAxis
              allowDataOverflow
              tick={(props) => renderXTick(props)}
              type="number"
              dataKey="time"
              domain={[Math.floor(zoomState.left), Math.ceil(zoomState.right)]}
              allowDecimals={false}
            />
            <YAxis
              allowDataOverflow
              tick={(props) => renderYTick(props)}
              type="category"
              dataKey="tag_hw"
              domain={[(dataMin) => dataMin - 1, (dataMax) => dataMax + 1]}
              padding={{ bottom: 10 }}
            />
            <Tooltip
              content={(props) => renderTooltip(props)}
              isAnimationActive={false}
            />
            <Scatter
              line={false}
              isAnimationActive={false}
              data={data}
              // onClick={(item, i, e) => {
              //   // e.persist()
              //   // clickFunc(item, e, dataKey)
              // }}
            >
              {
                data?.map((entry, index) => {
                  let color = 'red';
                  switch(entry.result) {
                    case 2:
                      color = 'red';
                      break;
                    case 3:
                      color = 'yellow';
                      break;
                    case 4:
                      color = 'green';
                      break;
                  }
                  return <Cell key={`cell-${index}`} stroke={color} strokeWidth={4} fill={color} />
                })
              }
            </Scatter>
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
        {/* <TableModal
          isOpen={isModalOpen}
          handleClose={() => setIsModalOpen(false)}
          data={filteredArchiveData}
          errorType={feature}
        /> */}
      </>
    )
  },
)

const ErrorMessage = () => (
  <div className="cdf-error">
    <StatePanel message="Error- could not find time series data." suggestion="Data may still be processing." />
  </div>
)

const getDailyData = (data) => {
  const tag_hws = data?.tag_hw;
  let arr = [];
  let minTime;
  let maxTime;

  tag_hws?.forEach((element, idx) => {
    const time = formatDateStamp(data?.test_date[idx]);
    arr.push({
      time: time,
      tag_hw: element,
      result: data?.result[idx],
      model: data?.model[idx]
    });
    minTime = minTime ? Math.min(minTime, time) : time
    maxTime = maxTime ? Math.max(maxTime, time) : time
  });
  return [arr, minTime, maxTime];
}

const ClxCheesecakeDailyStatus = ({ loadedData }) => {
  const [plotState, setPlotState] = useState({ isProcessing: true })
  const [filters, setFilters] = useState(tag_items);
  const [zoomState, setZoomState] = useState({
    minLeft: "",
    maxRight: "",
    left: "dataMin",
    right: "dataMax",
    top: "dataMax+1",
    bottom: "dataMin-1",
    selectedPlot: "",
  })
  const { sessionData } = plotState

  useEffect(() => {
    if (loadedData) {
      const [newSessionData, minTime, maxTime] = getDailyData(loadedData)
      console.log("newSessionData => ", newSessionData);
      const range = maxTime - minTime
      setPlotState((prevState) => ({
        ...prevState,
        sessionData: newSessionData,
        filtedData: newSessionData,
        isProcessing: false,
      }))

      setZoomState((prevState) => ({
        ...prevState,
        minLeft: minTime,
        maxRight: maxTime,
        left: minTime - range / 10,
        right: maxTime + range / 10,
      }))
    }
  }, [loadedData]);

  useEffect(() => {
    let data = _.clone(sessionData);
    const result = _.filter(data, item => filters.includes(item.tag_hw))
    setPlotState((prevState) => ({
      ...prevState,
      filtedData: result,
    }))
  }, [filters]);

  const zoom = (refLeft, refRight, refTop, refBottom) => {
    if (refLeft === refRight || refRight === "" || refTop === refBottom || refBottom === "") {
      return
    }

    setZoomState((prevState) => ({
      ...prevState,
      left: refLeft,
      right: refRight,
      top: refTop,
      bottom: refBottom
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
    let arr = _.clone(filters);
    const index = arr.indexOf(session);
    if (index > -1) {
      arr.splice(index, 1);
    } else {
      arr.push(session);
    }
    arr.sort();
    setFilters(arr);
  }

  return (
    <div style={{ padding: "2px" }}>
      {(isEmpty(loadedData) || isEmpty(sessionData)) && <ErrorMessage />}
      {!isEmpty(sessionData) && (
        <>
          <Row style={{ marginTop: "50px" }}>
            <Col>
              <Row className="justify-content-center">
                <Button variant="primary" onClick={handleReset}>
                  Reset
                </Button>
                <Entry
                  zoom={zoom}
                  zoomState={zoomState}
                  data={filtedData}
                  filters={filters}
                //   yRange={yRange}
                />
              </Row>
            </Col>
          </Row>
          <Row style={{ marginBottom: "10px" }}>
            <Col sm="1" style={{ minWidth: "125px" }}>
              <Button variant="default" onClick={() => setFilters(tag_items)}>
                Select All
              </Button>
            </Col>
            <Col sm="1" style={{ minWidth: "125px" }}>
              <Button variant="default" onClick={() => setFilters([])}>
                Remove All
              </Button>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col>
              <FilterTable
                items={tag_items}
                filter={filters}
                handleCheck={handleCheck}
              />
            </Col>
          </Row>
        </>
      )}
    </div>
  )
}

export default React.memo(ClxCheesecakeDailyStatus)

