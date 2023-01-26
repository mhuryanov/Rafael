import { Button } from "@dx/continuum-button"
import { StatePanel } from "@dx/continuum-state-panel"
import { Icons, Link, Text } from "@tidbits/react-tidbits"
import { Spinner } from "@tidbits/react-tidbits/Spinner"
import React, { lazy, Suspense, useEffect, useState } from "react"
import { Row } from "react-bootstrap"
import { useFetchArchiveData } from "../../../hooks/fetchData"
import { ARCHIVE_REPORTING_LOGS, TAGS_DEEPEXCLUDED } from "../../../utilities/constants"
import { addTags, isEmpty } from "../../../utilities/helpers"
import RangeSelect from "../../Widgets/RangeSelect"
import AggregatedDropdown from "./AggregatedDropdown"
import {
  getAggregatedData,
  getArchiveFilterOptions,
  getArchiveFilters,
  getCategories,
  getCdfTable,
  getCustomFilters,
} from "./helpers"

const AggregatedPlot = lazy(() => import("./AggregatedPlot"))

const _ = require("underscore")

const ErrorMessage = () => (
  <div className="cdf-error">
    <StatePanel message="Error- could not find aggregated data." suggestion="Data may still be processing." />
  </div>
)

const getTableData = (dict_list, columns, numRows) => {
  const tableData = []
  _.range(numRows).forEach((idx) => {
    const tableRow = []
    columns.forEach((column) => {
      const tableEntry = dict_list[column][idx]
      if (tableEntry !== undefined) tableRow.push(tableEntry)
    })
    if (tableRow.length > 0) tableData.push(tableRow)
  })
  return tableData
}

const AggreggatedDataToCsv = (aggregatedData, archives) => {
  const archiveIDs = Object.keys(aggregatedData)
  if (archiveIDs.length === 0) {
    return null
  }
  const columns = Object.keys(aggregatedData[archiveIDs[0]])
  let csvString = `${columns.join()},train,build,hw_model\n`

  let archive_details = {}

  let outjson = {}
  columns.forEach((col) => {
    outjson[col] = []
  })

  archiveIDs.forEach((archive_id) => {
    const idx = _.findIndex(archives, (r) => r.id === archive_id)
    archive_details[archive_id] = archives[idx]
    columns.forEach((col) => {
      outjson[col].push(...aggregatedData[archive_id][col])
    })
  })

  // return JSON.stringify(outjson)

  const numRows = outjson[columns[0]].length
  const csv_data = getTableData(outjson, columns, numRows)
  csv_data.forEach((row, i) => {
    const { build_train, build_version, model_hardware } = archive_details[row[0]]
    csvString += row.reduce((acc, value, i) => {
      return acc + `"${value}",`
    }, "")
    csvString += [build_train, build_version, model_hardware].join() + "\n"
  })
  return csvString
}

const Aggregated = ({ archives, technology, feature, selectedKpi = "percentiles" }) => {
  const archiveIds = archives.map((archive) => archive.id)
  const categories = getCategories(technology, feature, selectedKpi)
  const { tableName } = getCdfTable(technology, feature)
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, tableName)
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [customFilters, setCustomFilters] = useState(getCustomFilters(technology, feature))
  const [archiveFilters, setArchiveFilters] = useState(getArchiveFilters(technology, feature))
  const [yAxisRange, setYAxisRange] = useState({})
  const [showRange, setShowRange] = useState(false)
  const [cdfState, setCdfState] = useState({
    plotlyData: [],
    signalEnvs: [],
    customFilterOptions: {},
    isProcessing: true,
  })
  const { errorMessage } = archivesInfo
  const { customFilterOptions, isProcessing, plotlyData } =
    cdfState
  const [excludedArchiveIds, setExcludedArchiveIds] = useState([])

  const callbackAddExcluded = (exclude_id, deepExclude) => {
    if (deepExclude) {
      addTags(exclude_id, [TAGS_DEEPEXCLUDED])
    }
    setExcludedArchiveIds([...excludedArchiveIds, exclude_id])
  }

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const [
        newCustomFilterOptions,
        newPlotlyData,
      ] = getAggregatedData(
        archivesInfo,
        archives,
        technology,
        feature,
        selectedCategory,
        selectedKpi,
        customFilters,
        archiveFilters,
        excludedArchiveIds,
      )
      setCdfState((prevState) => ({
        ...prevState,
        plotlyData: newPlotlyData,
        customFilterOptions: newCustomFilterOptions,
        isProcessing: false,
      }))
      const newCustomFilters = JSON.parse(JSON.stringify(customFilters))
      Object.entries(newCustomFilterOptions).forEach(([filterName, filterOptions]) => {
        if (filterOptions.length > 0 && !filterOptions.includes(newCustomFilters[filterName])) {
          newCustomFilters[filterName] = filterOptions[0]
        }
      })
      if (JSON.stringify(newCustomFilters) !== JSON.stringify(customFilters)) setCustomFilters(newCustomFilters)
    }
  }, [isLoading, archivesInfo, selectedCategory, customFilters, archiveFilters, excludedArchiveIds])

  const handleRangeReset = () => {
    setYAxisRange({})
  }

  const handleSelectCategory = (option) => {
    const { value } = option
    setSelectedCategory(value)
    handleRangeReset()
  }

  const handleSelectFilter = (option, filterName) => {
    const { value } = option
    setCustomFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }))
    handleRangeReset()
  }

  const handleSelectArchiveFilter = (option, filterName) => {
    const { value } = option
    setArchiveFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }))
    handleRangeReset()
  }

  const handleDownload = () => {
    const d_data = new Blob([AggreggatedDataToCsv(archivesInfo, archives)], { type: "text/json;charset=utf-8," })
    const url = URL.createObjectURL(d_data)
    const e = document.getElementById(`${tableName} download`)
    e.setAttribute("href", url)
    e.setAttribute("download", `${tableName}.csv`)
    e.click()
  }

  console.log("Rendering Aggregated")
  return (
    <>
      {(plotlyData && plotlyData?.length > 0) && (
        <Row className="justify-content-end">
          <Text mr="15px" ml="15px" mt="5px">
            <Link id={`${tableName} download`} href="/" variant="default" onClick={handleDownload}>
              Download
            </Link>
          </Text>
        </Row>
      )}
      <Row className="justify-content-center">
        <AggregatedDropdown
          technology={technology}
          feature={feature}
          filter={selectedCategory}
          filterOptions={categories}
          callBack={handleSelectCategory}
          title="KPI"
        />
        {Object.keys(archiveFilters)
          .sort()
          .map((filterName) => (
            <AggregatedDropdown
              key={filterName}
              technology={technology}
              feature={feature}
              filter={archiveFilters[filterName]}
              callBack={(option) => handleSelectArchiveFilter(option, filterName)}
              filterOptions={getArchiveFilterOptions(technology, feature, filterName)}
              title={filterName}
            />
          ))}
        {Object.keys(customFilterOptions)
          .sort()
          .map((filterName) => (
            <AggregatedDropdown
              key={filterName}
              technology={technology}
              feature={feature}
              filter={customFilters[filterName]}
              callBack={(option) => handleSelectFilter(option, filterName)}
              filterOptions={customFilterOptions[filterName]}
              title={filterName}
            />
          ))}
      </Row>
      <Row className="justify-content-center aggregate-container">
        {errorMessage || (!plotlyData && !isProcessing && !isLoading) ? (
          <ErrorMessage />
        ) : (
          <>
            {showRange && (
              <>
                <RangeSelect range={yAxisRange} setRange={setYAxisRange} step={1} />
                <Button variant="default" onClick={handleRangeReset} style={{ marginLeft: "25px" }}>
                  Reset
                </Button>
              </>
            )}
            <Suspense fallback={<Spinner visible />}>
              <AggregatedPlot
                technology={technology}
                feature={feature}
                plotlyData={plotlyData}
                yAxisRange={yAxisRange}
                category={selectedCategory}
                callbackAddExcluded={callbackAddExcluded}
                customFilters={customFilters}
                archiveFilters={archiveFilters}
              />
            </Suspense>
            <Spinner visible={isProcessing || isLoading} />
          </>
        )}
      </Row>
    </>
  )
}

export default React.memo(Aggregated)
