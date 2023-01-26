/* eslint-disable react/forbid-prop-types */
import { StatePanel } from "@dx/continuum-state-panel"
import { Spinner } from "@tidbits/react-tidbits/Spinner"
import Table from "@tidbits/react-tidbits/Table"
import React, { useEffect, useState } from "react"
import { isEmpty } from "underscore"
import { DEFAULT_REPORT_TYPE } from "../../../utilities/constants"
import { addToObject } from "../../../utilities/helpers"
import { colorMap, getSummaryInfo } from "./helpers"
import SummaryTableLegend from "./SummaryTableLegend"

const shortid = require("shortid")
const _ = require("underscore")

const ErrorMessage = () => (
  <StatePanel message="Error- could not find KPI summary data." suggestion="Data may still be processing." />
)

const getCheesecakeFormatData = (archivesData, summaryInfo, stepCategory) => {
  const { categoryColumn, kpiColumn, valueColumn, itemsColumn, colorColumn } = summaryInfo
  let body = {}
  Object.values(archivesData)?.forEach((archivesInfo) => {
    const categories = categoryColumn ? archivesInfo[categoryColumn] : []
    let data = {}
    let test = null
    let item = null
    categories?.forEach((category, idx) => {
      if (category == stepCategory && idx != 0) {
        if (!body[test]) body[test] = {}
        if (!body[test][item]) body[test][item] = []
        body[test][item].push(data)
        data = {}
      }
      test = archivesInfo?.test[idx] || "_"
      item = itemsColumn ? archivesInfo[itemsColumn][idx] : "_"
      let kpi = categoryColumn ? archivesInfo[kpiColumn][idx] : ""
      const value = valueColumn ? archivesInfo[valueColumn][idx] : ""
      const color = colorColumn ? archivesInfo[colorColumn][idx] : ""
      if (!data[category]) data[category] = {}
      if (kpi == "") kpi = "_"
      data[category][kpi] = { value, color }
      if (idx == categories?.length - 1) {
        if (!body[test]) body[test] = {}
        if (!body[test][item]) body[test][item] = []
        body[test][item].push(data)
      }
    })
  })
  return body
}

const getTrendsFormatData = (archivesData, summaryInfo, stepCategory) => {
  const { categoryColumn, kpiColumn, valueColumn, colorColumn } = summaryInfo
  let body = []
  Object.values(archivesData)?.forEach((archivesInfo) => {
    const categories = categoryColumn ? archivesInfo[categoryColumn] : []
    let data = {}
    categories?.forEach((category, idx) => {
      if (category == stepCategory && idx != 0) {
        body.push(data)
        data = {}
      }
      let kpi = kpiColumn ? archivesInfo[kpiColumn][idx] : ""
      const value = valueColumn ? archivesInfo[valueColumn][idx] : ""
      const color = colorColumn ? archivesInfo[colorColumn][idx] : ""
      if (!data[category]) data[category] = {}
      if (kpi == "") kpi = "_"
      data[category][kpi] = { value, color }
      if (idx == categories?.length - 1) body.push(data)
    })
  })
  return body
}

const getFormatHeader = (archivesData, summaryInfo) => {
  const { categoryColumn, kpiColumn } = summaryInfo
  if (!archivesData) return null
  let header = {}
  Object.values(archivesData)?.forEach((archivesInfo) => {
    const categories = archivesInfo[categoryColumn]
    categories?.forEach((category, idx) => {
      let kpi = archivesInfo[kpiColumn][idx] || ""
      if (kpi == "") kpi = "_"
      if (!header[category]) header[category] = []
      if (!header[category].includes(kpi)) addToObject(header, category, [kpi])
    })
  })

  return header
}

const getHeader = (header, summaryInfo) => {
  if (!header) return null
  const categories = Object.keys(header)
  const firstHeader = summaryInfo?.firstHeader || []
  const subColHeaders = () => {
    return _.map(categories, (category) => {
      return _.map(header[category], (subCol) => {
        return (
          <Table.TH borderTop="none" className="table-header border-left border-right" key={shortid.generate()}>
            {subCol == "_" ? "" : subCol}
          </Table.TH>
        )
      })
    })
  }
  return (
    <Table.THead borderTop="none" borderBottom="none">
      <Table.TR borderTop="none" borderBottom="none">
        {_.map(firstHeader, (colHeader, idx) => (
          <Table.TH
            key={idx}
            className="table-header border-left border-right border-bottom"
            colSpan={1}
            rowSpan={2}
            style={{ borderBottom: "none" }}
          >
            {colHeader}
          </Table.TH>
        ))}
        {_.map(categories, (category, idx) => (
          <Table.TH
            key={idx}
            className="table-header border-left border-right border-bottom"
            colSpan={header[category].length || 1}
            style={{ borderBottom: "none" }}
          >
            {category == "_" ? "" : category}
          </Table.TH>
        ))}
      </Table.TR>
      <Table.TR>{subColHeaders()}</Table.TR>
    </Table.THead>
  )
}

const getColLength = (data) => {
  let leng = 0
  Object.keys(data)?.forEach((kpi) => {
    leng += data[kpi]?.length
  })
  return leng
}

const getCheesecakeTableBody = (data, header) => {
  const tests = Object.keys(data)
  let tableBody = []
  tests?.forEach((test, idx0) => {
    Object.keys(data[test])?.forEach((key, idx1) => {
      data[test][key]?.forEach((element, idx2) => {
        tableBody.push(
          <Table.TR>
            {idx1 == 0 && idx2 == 0 && (
              <Table.TD className="border-left border-right" rowSpan={getColLength(data[test])}>
                {test}
              </Table.TD>
            )}
            {idx2 == 0 && (
              <Table.TD className="border-left border-right" rowSpan={data[test][key]?.length || 1}>
                {key}
              </Table.TD>
            )}
            {_.map(Object.keys(header), (category) =>
              _.map(header[category], (kpi) => {
                if (!element[category] || !element[category][kpi])
                  return (
                    <Table.TD key={shortid.generate()} className="border-left border-right">
                      -
                    </Table.TD>
                  )
                else {
                  const { value, color } = element[category][kpi]
                  return (
                    <Table.TD key={shortid.generate()} className="border-left border-right">
                      <span style={{ backgroundColor: colorMap[color] || color }}>{value}</span>
                    </Table.TD>
                  )
                }
              }),
            )}
          </Table.TR>
        )
      })
    })
  })
  return tableBody
}

const getTableBody = (data, header) => {
  let tableBody = []
  if (!data || data.length == 0) return tableBody
  data?.forEach((element, idx) => {
    tableBody.push(
      <Table.TR key={idx}>
        {_.map(Object.keys(header), (category) =>
          _.map(header[category], (kpi) => {
            if (!element[category] || !element[category][kpi])
              return (
                <Table.TD key={shortid.generate()} className="border-left border-right">
                  -
                </Table.TD>
              )
            else {
              const { value, color } = element[category][kpi]
              return (
                <Table.TD key={shortid.generate()} className="border-left border-right">
                  <span style={{ backgroundColor: colorMap[color] || color }}>{value}</span>
                </Table.TD>
              )
            }
          }),
        )}
      </Table.TR>,
    )
  })
  return tableBody
}

const AllCustomerSummaryTable = ({
  technology,
  feature,
  filters,
  reportType = DEFAULT_REPORT_TYPE,
  archivesInfo,
  tableType,
}) => {
  const [tableState, setTableState] = useState({
    body: [],
    header: null,
    isProcessing: true,
  })
  const summaryInfo = getSummaryInfo(technology, feature, reportType)
  const { body, header, isProcessing } = tableState

  useEffect(() => {
    if (archivesInfo && !isEmpty(archivesInfo)) {
      const header = getFormatHeader(archivesInfo, summaryInfo)
      let formatData = []
      if (tableType == "cheesecake") formatData = getCheesecakeFormatData(archivesInfo, summaryInfom, "model")
      else if (tableType == "trends") formatData = getTrendsFormatData(archivesInfo, summaryInfo, "path")
      const data = formatData
      const newHeader = getHeader(header, summaryInfo)
      let newTableBody = []
      if (tableType == "cheesecake") newTableBody = getCheesecakeTableBody(data, header)
      else newTableBody = getTableBody(data, header)
      setTableState({
        body: newTableBody,
        header: newHeader,
        isProcessing: false,
      })
    }
  }, [archivesInfo, filters])

  const legendMapping = {
    "Pass": "green",
    "Pass w/ Issues": "orange",
    "Fail": "red",
  }

  console.log("Rendering AllCustomerSummaryTable")
  return (
    <>
      {body?.length == 0 && !isProcessing ? (
        <ErrorMessage />
      ) : (
        <div className="summary-table">
          <SummaryTableLegend
            technology={technology}
            feature={feature}
            reportType={reportType}
            providedMapping={legendMapping}
          />
          {technology !== "CLX" ? (
            <div className="outer-table">
              <div className="inner-table">
                <Table>
                  {header}
                  <Table.TBody>{body}</Table.TBody>
                </Table>
              </div>
            </div>
          ) : (
            <Table>
              {header}
              <Table.TBody>{body}</Table.TBody>
            </Table>
          )}
        </div>
      )}
      <Spinner visible={isProcessing} />
    </>
  )
}

export default React.memo(AllCustomerSummaryTable)
