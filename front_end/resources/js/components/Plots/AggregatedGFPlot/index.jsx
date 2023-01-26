import { Button } from "@dx/continuum-button"
import { StatePanel } from "@dx/continuum-state-panel"
import { Icons } from "@tidbits/react-tidbits"
import { Spinner } from "@tidbits/react-tidbits/Spinner"
import React, { lazy, Suspense, useEffect, useState } from "react"
import { Row } from "react-bootstrap"
import { useFetchArchiveData } from "../../../hooks/fetchData"
import { ARCHIVE_REPORTING_LOGS, SUMMARY_TABLE } from "../../../utilities/constants"
import { isEmpty } from "../../../utilities/helpers"
import RangeSelect from "../../Widgets/RangeSelect"
import AggregatedDropdown from "./AggregatedDropdown"
import {
  getAggregatedData,
  getArchiveFilterOptions,
  getArchiveFilters,
  getCustomFilters,
} from "./helpers"

const AggregatedPlot = lazy(() => import("./AggregatedPlot"))

const _ = require("underscore")

const ErrorMessage = () => (
  <div className="cdf-error">
    <StatePanel message="Error- could not find aggregated data." suggestion="Data may still be processing." />
  </div>
)

const technology = "CLX"
const feature = "GEOFENCING"

const AggregatedGFPlot = ({ archives, selectedKpi = "MaxFlaggingTime" }) => {
  const archiveIds = archives.map((archive) => archive.id)
  const categories = []
  const { tableName } = SUMMARY_TABLE.CLX.GEOFENCING
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
  const { customFilterOptions, isProcessing, plotlyData } = cdfState

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const [newCustomFilterOptions, newPlotlyData] = getAggregatedData(
        archivesInfo,
        archives,
        customFilters,
        archiveFilters,
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
  }, [isLoading, archivesInfo, selectedCategory, customFilters, archiveFilters])

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

  console.log("Rendering AggregatedGFPlot")
  return (
    <>
      <Row className="justify-content-center">
        {Object.keys(categories)
          .sort()
          .map((filterName) => (
            <AggregatedDropdown
              technology={technology}
              feature={feature}
              filter={selectedCategory}
              filterOptions={categories}
              callBack={handleSelectCategory}
              title="KPI"
            />
          ))}
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
                yAxisRange={yAxisRange}
                category={customFilters.kpi}
                plotlyData={plotlyData}
              />
            </Suspense>
            <Spinner visible={isProcessing || isLoading} />
          </>
        )}
      </Row>
    </>
  )
}

export default React.memo(AggregatedGFPlot)
