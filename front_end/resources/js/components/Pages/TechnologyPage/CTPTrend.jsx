/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import { Row } from 'react-bootstrap'

import { ARCHIVE_FILTER_QUERY } from '../../../utilities/constants'
import { buildQueryString, getArchiveFilterParams, isValidPipelineState } from '../../../utilities/helpers'
import { useFetchRafael } from '../../../hooks/fetchData'
import Box from '../../Box'

const AggregatedCTP = lazy(() => import('./AggregatedCTP'))

const _ = require('underscore')
const shortid = require('shortid')

const GROUP_BY = 'archive'


const CTPTrend = ({
  technology,
  feature,
  dateState
}) => {
  const { startDate, endDate } = dateState
  const queryString = buildQueryString({
    technology,
    feature,
    startDate,
    endDate
  })
  const url = startDate ? ARCHIVE_FILTER_QUERY : ''
  const [isLoading, queryResults] = useFetchRafael(getArchiveFilterParams(queryString, GROUP_BY, url), [])
  const [archives, setArchives] = useState([])

  useEffect(() => {
    if (!isLoading) {
      setArchives(
        _.map(queryResults, (archive, archiveId) => archive[0])
        .filter(archive => isValidPipelineState(archive.pipelinestate))
      )
    }

  }, [isLoading, queryResults])

  console.log('Rendering CTPTrend')
  return (
    <Row>
      <Box title="CTP Daily Trend" type="aggregated-statistics" isLoading={isLoading}>
        <AggregatedCTP key={shortid.generate()} technology={technology} feature={feature} dateState={dateState} archives={archives} />
      </Box>
    </Row>
  )
}

export default React.memo(CTPTrend)
