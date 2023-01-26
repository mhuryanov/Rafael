/* eslint-disable react/prop-types */
import { Text } from "@tidbits/react-tidbits"
import React, { useContext, useState } from "react"
import { useEffect } from "react"
import { Col, Row } from "react-bootstrap"
import { useParams } from "react-router-dom"
import { useFetchArchiveDataQuery } from "../../../../hooks/fetchData"
import { CUSTOM_LOGS, METRICS } from "../../../../utilities/constants"
import { getPreviousDate, isEmpty } from "../../../../utilities/helpers"
import Box from "../../../Box"
import TimeSeriesDailyStatusMetrics from "../../../Plots/TimeSeriesDailyStatusMetrics"
import { StateContext } from "../../../StateContext"
import DateRange from "../../../Widgets/DateRange"
import HelpTooltip from "../../../Widgets/HelpTooltip"

const checkData = (archivesInfo) => {
  if (archivesInfo == null || archivesInfo.errorMessage) {
    return null
  }
  return archivesInfo
}

const getDateQuery = (startDate, endDate) => {
  let dateQuery = ""
  dateQuery = startDate ? `date>='${startDate}'` : dateQuery
  dateQuery = endDate ? `date<='${endDate}'` : dateQuery
  dateQuery = startDate && endDate ? `date>='${startDate}' and date<='${endDate}'` : dateQuery
  return dateQuery
}

const getTimeSeriesData = (archivesInfo, columns) => {
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

const ReplayMicrolocationMetrics = ({}) => {
  console.log("Rendering ReplayMicroLocationMetrics")
  const {
    technology: urlTechnology,
    feature: urlFeature,
    reportType = METRICS,
    reportDate = dateQueryStartEnd,
  } = useParams()
  const technology = urlTechnology.toUpperCase()
  const feature = urlFeature.toUpperCase()
  const { userPreferences } = useContext(StateContext)
  const { dateRangePreferences, favorites } = userPreferences
  const [dateState, setDateState] = useState({
    dateRange: dateRangePreferences,
    startDate: getPreviousDate(dateRangePreferences.value),
    endDate: null,
    dateGroup: { label: "Default", value: null },
  })

  let currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - 1)
  let startDate = dateState["startDate"] ? dateState["startDate"].toISOString().split("T")[0] : undefined
  let endDate = dateState["endDate"]
    ? dateState["endDate"].toISOString().split("T")[0]
    : currentDate.toISOString().split("T")[0]
  const dateQueryStartEnd = getDateQuery(startDate, endDate)
  const archives = ["a0ed60d8-acf8-11eb-82c8-6805ca5ce028"]
  const providedColumns = {
    tableName: "r_replay_microlocation_perf_test_metrics_trends",
    columns: [
      "date",
      "tech_config",
      "metric_value",
      "tech_config",
      "row_index",
      "metric_value",
      "description",
      "color",
    ],
  }

  const [unsupervisedData, setUnsupervisedData] = useState(null);
  const [semisupervisedData, setSemisupervisedData] = useState(null);
  const [unsupervisedOptions, setUnsupervisedOptions] = useState(null);
  const [semisupervisedOptions, setSemisupervisedOptions] = useState(null);
  const { columns } = providedColumns ? providedColumns : getTableInfo(technology, feature, reportType)

  const [isLoadingUnsupervised, archivesInfoUnsupervised] = useFetchArchiveDataQuery(
    archives,
    CUSTOM_LOGS,
    "learning_mode",
    "Unsupervised",
    "r_replay_microlocation_perf_test_metrics_trends",
    dateQueryStartEnd,
  )

  const [isLoadingSemisupervised, archivesInfoSemisupervised] = useFetchArchiveDataQuery(
    archives,
    CUSTOM_LOGS,
    "learning_mode",
    "Semisupervised",
    "r_replay_microlocation_perf_test_metrics_trends",
    dateQueryStartEnd,
  )

  useEffect(() => {
    if (!isLoadingUnsupervised && archivesInfoUnsupervised) {
      const [newSessionData, minTime, maxTime, metricOptions, dbOptions, trainOptions] = getTimeSeriesData(archivesInfoUnsupervised, columns)
      setUnsupervisedData(newSessionData);
      setUnsupervisedOptions({
        metricOptions,
        dbOptions,
        trainOptions
      })
    }
  }, [isLoadingUnsupervised, archivesInfoUnsupervised]);

  useEffect(() => {
    if (!isLoadingSemisupervised && archivesInfoSemisupervised) {
      const [newSessionData, minTime, maxTime, metricOptions, dbOptions, trainOptions] = getTimeSeriesData(archivesInfoSemisupervised, columns)
      setSemisupervisedData(newSessionData);
      setSemisupervisedOptions({
        metricOptions,
        dbOptions,
        trainOptions
      })
    }
  }, [isLoadingSemisupervised, archivesInfoSemisupervised]);

  return (
    <>
      <h1 className="dashboard-title">Report</h1>
      <Row>
        <DateRange dateState={dateState} setDateState={setDateState} showDateGroup={false} />
      </Row>
      <Row>
        <Box
          title={
            <>
              Unsupervised Status Plots
              <HelpTooltip title="Tips" content={<Text>Click and drag on plots to zoom</Text>} />
            </>
          }
          isLoading={isLoadingUnsupervised}
          type="report-plot"
        >
          {!isEmpty(archivesInfoUnsupervised) && checkData(archivesInfoUnsupervised) && (
            <Col>
              <TimeSeriesDailyStatusMetrics
                loadedData={unsupervisedData}
                options={unsupervisedOptions}
              />
            </Col>
          )}
        </Box>
        <Box
          title={
            <>
              Semi-supervised Status Plots
              <HelpTooltip title="Tips" content={<Text>Click and drag on plots to zoom</Text>} />
            </>
          }
          isLoading={isLoadingSemisupervised}
          type="report-plot"
        >
          {!isEmpty(archivesInfoSemisupervised) && checkData(archivesInfoSemisupervised) && (
            <Col>
              <TimeSeriesDailyStatusMetrics
                loadedData={semisupervisedData}
                options={semisupervisedOptions}
              />
            </Col>
          )}
        </Box>
      </Row>
    </>
  )
}

export default React.memo(ReplayMicrolocationMetrics)
