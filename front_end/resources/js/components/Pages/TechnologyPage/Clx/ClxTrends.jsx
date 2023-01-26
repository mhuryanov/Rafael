/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Text } from '@tidbits/react-tidbits'

import HelpTooltip from '../../../Widgets/HelpTooltip'
import { useFetchArchiveDataQuery } from '../../../../hooks/fetchData'
import { CUSTOM_LOGS, KPI_TABLE } from '../../../../utilities/constants'
import { isEmpty } from '../../../../utilities/helpers'
import Box from '../../../Box'
import TimeSeriesDailyStatus from '../../../Plots/TimeSeriesDailyStatus'

const ClxTrends = ({
  technology, dateState, feature
}) => {
  let startDate = (dateState['startDate']) ? dateState['startDate'].toISOString().split('T')[0] : undefined
  let endDate = (dateState['endDate']) ? dateState['endDate'].toISOString().split('T')[0] : undefined
  let dateQuery = ""
  dateQuery = (startDate) ? `info_date>='${startDate}'` : dateQuery
  dateQuery = (endDate) ? `info_date<='${endDate}'` : dateQuery
  dateQuery = (startDate && endDate) ? `info_date>='${startDate}' and info_date<='${endDate}'` : dateQuery
  const archives = ['a0ed60d8-acf8-11eb-82c8-6805ca5ce028']
  const { tableName, columns } = KPI_TABLE[technology][feature]
  const [isLoading, archivesInfo] = useFetchArchiveDataQuery(archives, CUSTOM_LOGS, 'partition_id', 'status', tableName, dateQuery)

  console.log('Rendering ClxTrends')
  return (
    <>
      <Row>
        <Box
          title={<>
            Status Plots
            <HelpTooltip title="Tips" content={<Text>Click and drag on plots to zoom</Text>} />
          </>}
          isLoading={isLoading}
          type="report-plot"
        >
          {!isEmpty(archivesInfo) && (
            <Col>
              <TimeSeriesDailyStatus archives={archives} technology={technology} feature={feature} loadedData={archivesInfo} />
            </Col>
          )}
        </Box>
      </Row>
    </>
  )
}

export default React.memo(ClxTrends)
