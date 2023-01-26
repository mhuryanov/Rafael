/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import { Modal, ModalContent, ModalHeader } from "@dx/continuum-modal"
import { StatePanel } from "@dx/continuum-state-panel"
import { Spinner } from "@tidbits/react-tidbits/Spinner"
import _ from "lodash"
import React, { Suspense, useEffect, useState } from "react"
import { Col, Row } from "react-bootstrap"
import { Bar, BarChart, Label, Tooltip, XAxis, YAxis } from "recharts"
import { useFetchArchiveDataQuery } from "../../../hooks/fetchData"
import { CUSTOM_LOGS } from "../../../utilities/constants"
import { TransformCassandraData } from "../../../utilities/dataProcessing"
import { createArchiveLabels } from "../../../utilities/helpers"
import Table from "../../Widgets/SimpleTable"

const CustomCursor = (props) => (
  <g>
    <rect height={props.height + 2} y={23} width={1} fill={props.stroke} x={props.x - 1 / 2} />
  </g>
)

const CustomTooltipContent = ({ active, payload }, archiveLabels, labels) => {
  if (active && payload && payload.length) {
    const tooltipLabels = Object.entries(payload[0].payload)
      .filter(([label, value]) => labels.includes(label))
      .map(([label, value]) => {
        if (label === "archive_uuid") {
          return ["device", value in archiveLabels ? archiveLabels[value].label.split(" ")[0] : ""]
        }
        return [label, value]
      })

    return (
      <div
        className="recharts-default-tooltip"
        style={{
          margin: 0,
          padding: 10,
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          whiteSpace: "nowrap",
        }}
      >
        <ul className="recharts-tooltip-item-list" style={{ padding: 0, margin: 0 }}>
          {tooltipLabels.map(([label, value]) => (
            <li
              className="recharts-tooltip-item"
              key={`tooltip-item-${label}`}
              style={{ display: "block", paddingTop: 4, paddingBottom: 4 }}
            >
              <span className="recharts-tooltip-item-name">{label}</span>
              <span className="recharts-tooltip-item-separator">: </span>
              <span className="recharts-tooltip-item-value">{value}</span>
              <span className="recharts-tooltip-item-unit" />
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return null
}

const TableModal = ({ isOpen, handleClose, data, title }) => (
  <div className="zaxis-modal">
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalHeader>Radar List</ModalHeader>
      <div>
        <strong>Signature: </strong>
        {title}
      </div>
      <hr />
      <ModalContent>
        <Row className="justify-content-center zero-margin">
          <Table
            columns={[
              {
                Header: "Radar",
                accessor: "radar",
                Cell: (row) => (
                  <div>
                    <a href={`rdar://${row.value}`}>rdar://{row.value}</a>{" "}
                  </div>
                ),
              },
            ]}
            data={data}
          />
        </Row>
      </ModalContent>
    </Modal>
  </div>
)

const Radars = ({ maxWidth, radars, signature }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const radarList = radars.split(",")
  const shortenedList = radarList.slice(0, 3).join(", ")
  const radarInfo = radarList.map((radar) => ({ radar }))

  return (
    <>
      <div style={{ maxWidth }} onClick={() => setIsModalOpen(true)}>
        {radarList.length > 3 ? `${shortenedList}, …` : shortenedList}
      </div>
      <TableModal isOpen={isModalOpen} handleClose={() => setIsModalOpen(false)} data={radarInfo} title={signature} />
    </>
  )
}
const ErrorMessage = () => (
  <StatePanel message="Error - could not find any data." suggestion="Data may still be processing." />
)

const DeviceCrashes = ({ archives }) => {
  const columns = [
    "archive_uuid",
    "build",
    "daemon",
    "log_type",
    "radar_list",
    "signature_count",
    "signature_digest",
    "signature",
    "supplemental_data",
  ]
  const archiveIds = archives.map((archive) => archive.id)
  const archiveDates = archives.map((archive) => archive.test_date)
  const [isLoading, archivesInfo] = useFetchArchiveDataQuery(
    archiveIds,
    CUSTOM_LOGS,
    "type",
    "crash",
    "r_crash_summary_test",
    `date='${archiveDates[0]}' AND archive_uuid IN (${archiveIds.join(", ")})`,
    columns,
    [],
  )
  const archiveLabels = createArchiveLabels(archives)
  const { errorMessage } = archivesInfo
  const [transformedCrashSummarySignature, setTransformedCrashSummarySignature] = useState([])
  const [transformedCrashSummaryDaemon, setTransformedCrashSummaryDaemon] = useState([])

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      let crashSummarySignature = TransformCassandraData(archivesInfo)

      crashSummarySignature = _.chain(crashSummarySignature)
        .groupBy((item) => JSON.stringify([item.signature_digest, item.daemon]))
        .map((objects, key) => ({
          archive_uuid: objects[0].archive_uuid,
          build: objects[0].build,
          daemon: objects[0].daemon,
          log_type: objects[0].log_type,
          radar_list: objects[0].radar_list,
          signature_count: _.sumBy(objects, "signature_count"),
          signature_digest: objects[0].signature_digest,
          signature: objects[0].signature,
          supplemental_data: objects[0].supplemental_data,
        }))
        .orderBy(["signature_count"], ["asc"])
        .map((object, index) => _.merge(object, { row_index: index }))
        .value()

      const crashSummaryDaemon = _.chain(crashSummarySignature)
        .groupBy("daemon")
        .map((objects, key) => ({
          daemon: key,
          archive_uuid: objects[0].archive_uuid,
          daemon_count_crash: _.sumBy(_.filter(objects, { log_type: "crash" }), "signature_count"),
          daemon_count_excresource: _.sumBy(_.filter(objects, { log_type: "exc_resource" }), "signature_count"),
          daemon_count_all: _.sumBy(
            _.filter(objects, (log) => log.log_type == "crash" || log.log_type == "exc_resource"),
            "signature_count",
          ),
        }))
        .orderBy(["daemon_count_all"], ["asc"])
        .value()

      setTransformedCrashSummarySignature(crashSummarySignature)
      setTransformedCrashSummaryDaemon(crashSummaryDaemon)
    }
  }, [isLoading, archivesInfo, errorMessage])

  const calculateHeight = (itemCount) => {
    const startHeight = 400
    switch (true) {
      case _.inRange(itemCount, 0, 8):
        return startHeight
      case _.inRange(itemCount, 8, 15):
        return startHeight * 1.2
      default:
        return startHeight * 2
    }
  }

  const signatureBarChartHeight = calculateHeight(transformedCrashSummarySignature.length)
  const daemonBarChartHeight = calculateHeight(transformedCrashSummaryDaemon.length)

  const SignatureDigest = ({ style, children }) => (
    <div
      style={{
        ...style,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {children}
    </div>
  )

  const signatureSummary = (props) =>
    CustomTooltipContent(props, archiveLabels, [
      "daemon",
      "signature_digest",
      "signature_count",
      "archive_uuid",
      "log_type",
    ])
  const daemonSummary = (props) =>
    CustomTooltipContent(props, archiveLabels, [
      "daemon",
      "archive_uuid",
      "daemon_count_crash",
      "daemon_count_excresource",
    ])
  return (
    <>
      <Row>
        <Col className="box devicel3-table">
          <h1 className="plot-title" style={{ marginTop: "25px" }}>
            Crash Summary by Daemon
          </h1>
          <Row className="justify-content-center zero-margin">
            {errorMessage || transformedCrashSummaryDaemon.length === 0 ? (
              <ErrorMessage />
            ) : (
              <Suspense fallback={<Spinner visible />}>
                <BarChart
                  width={800}
                  height={daemonBarChartHeight}
                  data={transformedCrashSummaryDaemon}
                  margin={{ bottom: 30, left: 60, right: 20 }}
                  layout="vertical"
                >
                  <XAxis
                    type="number"
                    orientation="bottom"
                    domain={[(dataMin) => 0, (dataMax) => Math.ceil(dataMax * 1.25)]}
                    interval={0}
                  >
                    <Label value="Signature Count" offset={0} position="bottom" />
                  </XAxis>
                  <YAxis
                    type="category"
                    dataKey="daemon"
                    dx={-10}
                    tickLine={false}
                    width={150}
                    label={{ value: "Daemon", angle: -90, position: "insideLeft" }}
                  />
                  <Bar dataKey="daemon_count_crash" fill="#007bff" stackId="a" />
                  <Bar dataKey="daemon_count_excresource" fill="#e4b71f" stackId="a" />
                  <Tooltip cursor={<CustomCursor />} content={daemonSummary} />
                </BarChart>
              </Suspense>
            )}
          </Row>
        </Col>
      </Row>
      <Row>
        <Col className="box devicel3-table">
          <h1 className="plot-title" style={{ marginTop: "25px" }}>
            Crash Summary by Signature
          </h1>
          <Row className="justify-content-center zero-margin">
            {errorMessage || transformedCrashSummarySignature.length === 0 ? (
              <ErrorMessage />
            ) : (
              <Suspense fallback={<Spinner visible />}>
                <BarChart
                  width={800}
                  height={signatureBarChartHeight}
                  data={transformedCrashSummarySignature}
                  margin={{ bottom: 30, left: 70, right: 20 }}
                  layout="vertical"
                >
                  <XAxis
                    type="number"
                    orientation="bottom"
                    domain={[(dataMin) => 0, (dataMax) => Math.ceil(dataMax * 1.25)]}
                    interval={0}
                  >
                    <Label value="Signature Count" offset={0} position="bottom" />
                  </XAxis>
                  <YAxis
                    type="category"
                    dataKey="signature_digest"
                    interval={0}
                    tickLine
                    padding={{ left: 30, right: 30 }}
                    tickFormatter={(tick) => (!isNaN(tick) ? tick : `${tick.substring(0, 8)}‥`)}
                  >
                    <Label
                      value="Signature ID"
                      offset={-60}
                      position="insideLeft"
                      angle={-90}
                      style={{ color: "#ff0000" }}
                    />
                  </YAxis>
                  <Bar dataKey="signature_count" fill="#007bff" />
                  <Tooltip cursor={<CustomCursor />} content={signatureSummary} />
                </BarChart>
              </Suspense>
            )}
          </Row>
          {!errorMessage && transformedCrashSummarySignature.length > 0 && (
            <Row className="justify-content-center zero-margin">
              <Table
                columns={[
                  {
                    Header: "Daemon",
                    accessor: "daemon",
                    Cell: (row) => <div style={{ width: 0, minWidth: "10px", maxWidth: "10px" }}>{row.value}</div>,
                  },
                  {
                    Header: "Signature ID",
                    accessor: "signature_digest",
                    Cell: (row) => (
                      <SignatureDigest style={{ textAlign: "left", minWidth: "100px", maxWidth: "100px" }}>
                        {row.value}
                      </SignatureDigest>
                    ),
                  },
                  {
                    Header: "Signature",
                    accessor: "signature",
                    Cell: (row) => <div style={{ maxWidth: "1000px" }}>{row.value}</div>,
                  },
                  {
                    Header: "Count",
                    accessor: "signature_count",
                    Cell: (row) => <div style={{ maxWidth: "100px" }}>{row.value}</div>,
                  },
                  {
                    Header: "Log Type",
                    accessor: "log_type",
                    Cell: (row) => <div style={{ maxWidth: "1000px" }}>{row.value}</div>,
                  },
                  {
                    Header: "Radar List",
                    accessor: "radar_list",
                    Cell: (row) => (
                      <Radars maxWidth="1000px" radars={row.value} signature={row.cell.row.values.signature} />
                    ),
                  },
                ]}
                data={transformedCrashSummarySignature}
              />
            </Row>
          )}
        </Col>
      </Row>
    </>
  )
}

export default React.memo(DeviceCrashes)
