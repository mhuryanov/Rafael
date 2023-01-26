/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Text } from '@tidbits/react-tidbits'
import HelpTooltip from '../../../Widgets/HelpTooltip'
import { useFetchArchiveDataQuery } from '../../../../hooks/fetchData'
import {
  CUSTOM_LOGS,
  PLOT_TABLE,
  KPI_TABLE,
  SUMMARY_TABLE
} from '../../../../utilities/constants'
import { isEmpty } from '../../../../utilities/helpers'
import Box from '../../../Box'
import TimeSeriesDailyStatus from '../../../Plots/TimeSeriesDailyStatus'

function getDateQuery(startDate, endDate) {
  let dateQuery = ''
  dateQuery = startDate ? `date>='${startDate}'` : dateQuery
  dateQuery = endDate ? `date<='${endDate}'` : dateQuery
  dateQuery = startDate && endDate ? `date>='${startDate}' and date<='${endDate}'` : dateQuery
  return dateQuery
}

// Convert test_pass boolean to string
// row_index column value itself is useless, we just need to use this room to overwrite to set "double value"
const transformData = (archivesInfo) => {
  if (archivesInfo== null || archivesInfo.errorMessage) { return null }
  const data = archivesInfo['a0ed60d8-acf8-11eb-82c8-6805ca5ce028']
  let test_pass = data.test_pass
  let double_value = []
  test_pass = test_pass.map(test => {
    if (test) {
      double_value.push(2)
      return 'pass'
    }
    else {
      double_value.push(1)
      return 'fail'
    }
  })
  data.test_pass = test_pass
  data.row_index = double_value
  return archivesInfo
}

const ReplayMicrolocationTrends = ({ technology, dateState, feature }) => {
  console.log('Rendering ReplayMicroLocationTrends')
  let startDate = dateState['startDate'] ? dateState['startDate'].toISOString().split('T')[0] : undefined
  let endDate = dateState['endDate'] ? dateState['endDate'].toISOString().split('T')[0] : undefined
  //  const { tableName, columns } = PLOT_TABLE[technology]['MICROLOCATION']
  const { tableName, columns } = KPI_TABLE[technology][feature]
  const archives = ['a0ed60d8-acf8-11eb-82c8-6805ca5ce028']
  const dateQueryStartEnd = getDateQuery(startDate, endDate)

  const [isLoadingUnsupervised, archivesInfoUnsupervised] = useFetchArchiveDataQuery(
    archives,
    CUSTOM_LOGS,
    'learning_mode',
    'Unsupervised',
    SUMMARY_TABLE.REPLAY.MICROLOCATION.tableName,
    dateQueryStartEnd
  )
  const [isLoadingSemisupervised, archivesInfoSemisupervised] = useFetchArchiveDataQuery(
    archives,
    CUSTOM_LOGS,
    'learning_mode',
    'Semisupervised',
    SUMMARY_TABLE.REPLAY.MICROLOCATION.tableName,
    dateQueryStartEnd
  )

  return (
    <>
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
          {!isEmpty(archivesInfoUnsupervised) && transformData(archivesInfoUnsupervised) && (
            <Col>
              <TimeSeriesDailyStatus
                archives={archives}
                technology={technology}
                feature={feature}
                loadedData={archivesInfoUnsupervised}
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
          {!isEmpty(archivesInfoSemisupervised) && transformData(archivesInfoSemisupervised) && (
            <Col>
              <TimeSeriesDailyStatus
                archives={archives}
                technology={technology}
                feature={feature}
                loadedData={archivesInfoSemisupervised}
              />
            </Col>
          )}
        </Box>
      </Row>
    </>
  )
}

export default React.memo(ReplayMicrolocationTrends)
