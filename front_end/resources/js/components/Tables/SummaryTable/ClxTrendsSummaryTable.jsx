/* eslint-disable react/forbid-prop-types */
import { StatePanel } from "@dx/continuum-state-panel"
import { Spinner } from "@tidbits/react-tidbits/Spinner"
import Table from "@tidbits/react-tidbits/Table"
import React, { useEffect, useState } from "react"
import { useFetchArchiveDataQuery } from "../../../hooks/fetchData"
import { CUSTOM_LOGS, DEFAULT_REPORT_TYPE, KPI_NAMES } from "../../../utilities/constants"
import { addToObject, filterArchiveData, isEmpty, setDefaultObject } from "../../../utilities/helpers"
import Filter from "../../Widgets/Filter"
import { getSummaryInfo } from "./helpers"
import SummaryRow from "./SummaryRow"
import SummaryTableLegend from "./SummaryTableLegend"

const shortid = require("shortid")
const _ = require("underscore")

const ErrorMessage = () => (
  <StatePanel message="Error- could not find KPI summary data." suggestion="Data may still be processing." />
)

const getCategoryMapping = (technology, feature, archivesInfo, summaryInfo, jobName, filters) => {
  const { segmentColumn, sourceColumn, unitColumn, tableNameColumn, categoryColumn, kpiColumn } = summaryInfo
  const { customFilters = {} } = filters
  let { segment, source, table_name } = customFilters
  const categoryMapping = {}
  Object.values(archivesInfo).forEach((archiveData) => {
    if (!isEmpty(archiveData)) {
      const [start, end] = filterArchiveData(
        archiveData,
        segment,
        segmentColumn,
        source,
        sourceColumn,
        jobName,
        tableNameColumn,
      )
      const categories = archiveData[categoryColumn].slice(start, end)
      const selectedCategories = _.uniq(categories)
      selectedCategories.forEach((selectedCategory) => {
        categories.forEach((category, categoryIdx) => {
          if (category === selectedCategory) {
            const idx = start + categoryIdx
            setDefaultObject(categoryMapping, selectedCategory)
            const categoryKpi = kpiColumn ? archiveData[kpiColumn][idx] : ""
            addToObject(categoryMapping[category], "kpis", [categoryKpi])
            if (!("name" in categoryMapping[category])) {
              let unit = unitColumn ? archiveData[unitColumn][idx] : ""
              addToObject(
                categoryMapping[category],
                "name",
                (technology === "CLX" && categoryKpi) ||
                  !unit ||
                  unit === "null" ||
                  category.toUpperCase().includes(`(${unit.toUpperCase()})`)
                  ? category
                  : `${category} (${unit})`,
              )
            }
          }
        })
      })
    }
  })
  Object.keys(categoryMapping).forEach((category) => {
    categoryMapping[category].kpis = _.uniq(categoryMapping[category].kpis)
  })
  return categoryMapping
}

const getColSpan = (colName, categoryMapping) => {
  if (colName === "") return 1
  const [mapping] = Object.values(categoryMapping).filter((val) => val.name === colName)
  if (!mapping) return 1
  return mapping.kpis.length
}

const getColumnHeaders = (technology, feature, categoryMapping, reportType) => {
  const colHeaders = []
  const subColHeaders = []
  Object.keys(categoryMapping).forEach((category) => {
    const { name: categoryName, kpis: categoryKpis } = categoryMapping[category]
    colHeaders.push(categoryName)
    categoryKpis.forEach((kpi) => {
      subColHeaders.push(kpi)
    })
  })
  if (subColHeaders.filter((subColumn) => subColumn !== "").length === 0) return [colHeaders, []]
  return [colHeaders, subColHeaders]
}

const formatSubColHeader = (subColHeader, technology) => {
  switch (true) {
    case technology === "CLX":
      return KPI_NAMES.CLX[subColHeader] || subColHeader
    case subColHeader.includes("rdar://"):
      const matches = subColHeader.match(/(\d+)/)
      const radarId = matches ? matches[0] : "N/A"
      return <a href={subColHeader.slice(1, subColHeader.length - 1)}>{radarId}</a>
    default:
      break
  }
  return subColHeader
}

const getHeader = (technology, feature, categoryMapping, archiveIds, filters, setFilters, reportType) => {
  const [colHeaders, subColHeaders] = getColumnHeaders(technology, feature, categoryMapping, reportType)
  console.log(colHeaders, subColHeaders)
  const getSubColumnHeaders = () => {
    let colIdx = 0
    return _.map(colHeaders, (colHeader) => {
      const colSpan = getColSpan(colHeader, categoryMapping)
      return _.range(colSpan).map((subIdx) => {
        let className = ""
        if (subIdx === 0) className += "border-left "
        if (subIdx === colSpan - 1) className += "border-right "
        const subColHeader = formatSubColHeader(subColHeaders[colIdx], technology)
        colIdx += 1
        if (subColHeader !== "") className += "table-header "
        return (
          <Table.TH borderTop="none" key={shortid.generate()} className={className}>
            {subColHeader}
          </Table.TH>
        )
      })
    })
  }
  return (
    <Table.THead borderTop="none" borderBottom="none">
      <Table.TR borderTop="none" borderBottom="none">
        {_.map(colHeaders, (colHeader, idx) => (
          <Table.TH
            key={shortid.generate()}
            className={colHeader !== "" ? "table-header border-left border-right" : "empty-header"}
            colSpan={getColSpan(colHeader, categoryMapping)}
            style={subColHeaders.length !== 0 ? { borderBottom: "none" } : {}}
          >
            {colHeader === "Select" ? (
              <div className="select-header">
                <Filter
                  title="Select"
                  type="archiveIds"
                  items={archiveIds}
                  filters={filters}
                  setFilters={setFilters}
                  showItems={false}
                />
              </div>
            ) : (
              colHeader
            )}
          </Table.TH>
        ))}
      </Table.TR>
      {subColHeaders.length > 0 && <Table.TR borderTop="none">{getSubColumnHeaders()}</Table.TR>}
    </Table.THead>
  )
}

const getNumInEach = (arr) => {
  let res = arr.length
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] == arr[0]) {
      res = i
      break
    }
  }
  return res
}

const chunkArray = (array, size) => {
  let result = []
  for (let i = 0; i < array.length; i += size) {
    let chunk = array.slice(i, i + size)
    result.push(chunk)
  }
  return result
}

const getTableBody = (
  archivesInfo,
  archives,
  technology,
  feature,
  filters,
  setFilters,
  categoryMapping,
  reportType,
) => {
  const tableBody = []
  let tableBodyDict = {}
  let summaryRowDict = {}
  let archiveLabels = {}
  archives.forEach((archive) => {
    archiveLabels[archive] = { label: archive, color: "#DDA0DD" }
  })
  Object.keys(archivesInfo).forEach((archiveId) => {
    const archiveData = archivesInfo[archiveId]
    let numEachRow = getNumInEach(archiveData["category"])
    let numRows = archiveData["category"].length / numEachRow
    Object.keys(archiveData).forEach((colName) => {
      const colData = archiveData[colName]
      let thisdata = chunkArray(colData, numEachRow)
      tableBodyDict[colName] = chunkArray(colData, numEachRow)
    })
    for (var i = 0; i < numRows; i++) {
      Object.keys(tableBodyDict).forEach((colName) => {
        let data = tableBodyDict[colName][i]
        summaryRowDict[colName] = tableBodyDict[colName][i]
      })
      tableBody.push(
        <SummaryRow
          key={shortid.generate()}
          archive={_.find(archives, (archive) => archive === archiveId)}
          archiveData={summaryRowDict}
          archiveLabel={archiveLabels[archiveId]}
          technology={technology}
          feature={feature}
          filters={filters}
          setFilters={setFilters}
          categoryMapping={categoryMapping}
          reportType={reportType}
        />,
      )
      summaryRowDict = {}
    }
  })
  return tableBody
}

const ClxTrendsSummaryTable = ({
  archives,
  technology,
  feature,
  filters,
  setFilters,
  jobName,
  reportDate,
  reportType = DEFAULT_REPORT_TYPE,
}) => {
  const archiveIds = archives
  const summaryInfo = getSummaryInfo(technology, feature, reportType)
  const { tableName } = summaryInfo
  let queryString = `info_date='${reportDate}'`
  const [isLoading, archivesInfo] = useFetchArchiveDataQuery(
    archiveIds,
    CUSTOM_LOGS,
    "job",
    jobName,
    tableName,
    queryString,
  )
  const [tableState, setTableState] = useState({
    body: [],
    header: null,
    isProcessing: true,
  })
  const { errorMessage } = archivesInfo
  const { body, header, isProcessing } = tableState

  const legendMapping = {
    "Pass": "green",
    "Pass w/ Issues": "orange",
    "Fail": "red",
  }

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const categoryMapping = getCategoryMapping(technology, feature, archivesInfo, summaryInfo, jobName, filters)
      const newTableBody = getTableBody(
        archivesInfo,
        archives,
        technology,
        feature,
        filters,
        setFilters,
        categoryMapping,
        reportType,
      )
      const newHeader = getHeader(technology, feature, categoryMapping, archiveIds, filters, setFilters, reportType)
      setTableState({
        body: newTableBody,
        header: newHeader,
        isProcessing: false,
      })
    }
  }, [isLoading, archivesInfo, errorMessage, filters])

  console.log("Rendering ClxTrendsSummaryTable")
  return (
    <>
      {errorMessage || (body.length === 0 && !isProcessing) ? (
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
      <Spinner visible={isLoading} />
    </>
  )
}

export default React.memo(ClxTrendsSummaryTable)
