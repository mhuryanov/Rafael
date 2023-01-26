/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import {
  Row, Col
} from 'react-bootstrap'
import { Text } from '@tidbits/react-tidbits'
import HelpTooltip from '../../../Widgets/HelpTooltip'
import { useFetchArchiveDataQuery } from '../../../../hooks/fetchData'
import {
  CUSTOM_LOGS,
  KPI_TABLE,
  PLOT_TABLE,
  SUMMARY_TABLE,
  METRICS
} from '../../../../utilities/constants'
import { getPreviousDate, isEmpty } from '../../../../utilities/helpers'
import Box from '../../../Box'
import TimeSeriesDailyStatus from '../../../Plots/TimeSeriesDailyStatus'
import TimeSeriesDailyStatus1 from '../../../Plots/TimeSeriesDailyStatus1'
import DateRange from '../../../Widgets/DateRange'
import { StateContext } from '../../../StateContext'

const checkData = (archivesInfo) => {
  if (archivesInfo== null || archivesInfo.errorMessage) { return null }
  return archivesInfo
}

const getDateQuery = (startDate, endDate) => {
  let dateQuery = ''
  dateQuery = startDate ? `date>='${startDate}'` : dateQuery
  dateQuery = endDate ? `date<='${endDate}'` : dateQuery
  dateQuery = startDate && endDate ? `date>='${startDate}' and date<='${endDate}'` : dateQuery
  return dateQuery
}

const ReplayMicrolocationMetrics = ({}) => {
  const { technology: urlTechnology, feature: urlFeature, reportType = METRICS, reportDate=dateQueryStartEnd } = useParams()
  const technology = urlTechnology.toUpperCase()
  const feature = urlFeature.toUpperCase()
  const { userPreferences } = useContext(StateContext)
  const { dateRangePreferences, favorites } = userPreferences
  const [dateState, setDateState] = useState({ // special case for AWD, might refactor later
    dateRange: technology !== 'AWD' ? dateRangePreferences : { label: 'Custom Range', value: 'custom' },
    startDate: technology !== 'AWD' ? getPreviousDate(dateRangePreferences.value) : null,
    endDate: null,
    dateGroup: { label: 'Default', value: null }
  })
  
  let currentDate = new Date();
  currentDate.setDate( currentDate.getDate() - 1 );
  let startDate = dateState['startDate'] ? dateState['startDate'].toISOString().split('T')[0] : undefined
  let endDate = dateState['endDate'] ? dateState['endDate'].toISOString().split('T')[0] : currentDate.toISOString().split('T')[0]

  const dateQueryStartEnd = getDateQuery(startDate, endDate)

  const { tableName, columns } = PLOT_TABLE[technology][feature]
  const archives = ['a0ed60d8-acf8-11eb-82c8-6805ca5ce028']
  const [data, setData] = useState()
// const [isLoading, archivesInfo] = useFetchArchiveDataQuery(archives, CUSTOM_LOGS, 'job', jobName, 'r_replay_microlocation_perf_test_metrics_trends')
  const providedColumns = {
  tableName: 'r_replay_microlocation_perf_test_metrics_trends',
  // columns: ['learning_mode',' data','row_index', 'microlocation_version', 'metric_threshold_value', ',tech_config', 'db_name', 'metric_name', 'metric_value', 'train_name']
  // 'metric_bm_value', 'description', 'bolt_task_id', 'sw_ver', 'train_name', 'bats_container', 'corelocation_git_sha', 'color']
  columns: ['date', 'tech_config', 'metric_value', 'tech_config', 'row_index', 'metric_value', 'description', 'color']
  // }
  }
  const [isLoadingUnsupervised, archivesInfoUnsupervised] = useFetchArchiveDataQuery(
    archives,
    CUSTOM_LOGS,
    'learning_mode',
    'Unsupervised',
    'r_replay_microlocation_perf_test_metrics_trends',  
    //SUMMARY_TABLE.REPLAY.MICROLOCATION.tableName,
    dateQueryStartEnd
  )
  
  const [isLoadingSemisupervised, archivesInfoSemisupervised] = useFetchArchiveDataQuery(
    archives,
    CUSTOM_LOGS,
    'learning_mode',
    'Semisupervised',
    'r_replay_microlocation_perf_test_metrics_trends',
    //SUMMARY_TABLE.REPLAY.MICROLOCATION.tableName,
    dateQueryStartEnd
  )

  const { errorArchivesInfoUnsupervisedMessage } = [archivesInfoUnsupervised];
  const { errorArchivesInfoSemisupervisedMessage } = [ archivesInfoSemisupervised ];
  useEffect(() => {
    if (!isLoadingUnsupervised && !isLoadingSemisupervised && !errorArchivesInfoSemisupervisedMessage) {
      setData(archivesInfoSemisupervised)
    }
  }, [isLoadingSemisupervised, archivesInfoSemisupervised])

  useEffect(() => {
    if (!isLoadingUnsupervised && archivesInfoUnsupervised && !errorArchivesInfoUnsupervisedMessage) {
      setData(archivesInfoUnsupervised)
    }
  }, [archivesInfoUnsupervised, isLoadingUnsupervised]);

  return (
    <>
      <h1 className="dashboard-title">
          Report
        </h1>
      <Row>
          <DateRange
            dateState={dateState}
            setDateState={setDateState}
            showDateGroup={technology === 'ZAXIS'}
          />
        </Row>
      <Row>
        <Box
          title={
            <>
              Unsupervised Status Plots
              <HelpTooltip
                title="Tips"
                content={<Text>Click and drag on plots to zoom</Text>}
              />
            </>
          }
          isLoading={isLoadingUnsupervised}
          type="report-plot">
          {!isEmpty(archivesInfoUnsupervised) && checkData(archivesInfoUnsupervised) && (
            <Col>
              <TimeSeriesDailyStatus1
                archives={archives}
                technology={technology}
                feature={feature}
                providedColumns={providedColumns}
                loadedData={data}
                reportType={reportType}
                reportDate={reportDate}
              />
            </Col>
          )}
        </Box>
        <Box
          title={
            <>
              Semi-supervised Status Plots
              <HelpTooltip
                title="Tips"
                content={<Text>Click and drag on plots to zoom</Text>}
              />
            </>
          }
          isLoading={isLoadingSemisupervised}
          type="report-plot">
          {!isEmpty(archivesInfoSemisupervised) && checkData(archivesInfoSemisupervised) && (
            <Col>
              <TimeSeriesDailyStatus1
                archives={archives}
                technology={technology}
                feature={feature}               
                providedColumns={providedColumns}
                loadedData={data}
                reportType={reportType}
                reportDate={reportDate}
              />
            </Col>
          )}
        </Box>
      </Row>
    </>
  )
}

export default React.memo(ReplayMicrolocationMetrics)
