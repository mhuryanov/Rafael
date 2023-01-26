/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { useState, useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Suspense, lazy } from 'react'
import { Text } from '@tidbits/react-tidbits'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import HelpTooltip from '../../Widgets/HelpTooltip'
import { buildQueryString, getArchiveFilterParams } from '../../../utilities/helpers'
import { useFetchRafael } from '../../../hooks/fetchData'
import { CTP } from '../../../utilities/constants'

const shortid = require('shortid')
const _ = require('underscore')

const ResultsTable = lazy(() => import('../../Tables/ResultsTable'))


const DEVICE_LEGEND_LABELS = [
  { name: 'Complete', color: 'rgb(107,202,101)' },
  { name: 'Processing', color: 'rgb(43,122,216)' },
  { name: 'Failed', color: 'rgb(224,66,50)' }
]

export const TooltipContent = () => {
  return (
    <Row className="justify-content-center">
      {DEVICE_LEGEND_LABELS.map(label => (
        <Col key={label.name}>
          <Text p="5px" style={{ minWidth: '100px' }}>
            <span className="color-block legend-entry" style={{ backgroundColor: label.color }} />
            <span>{label.name}</span>
          </Text>
        </Col>
      ))}
    </Row>
  )
}

const ReportCatalog = ({ technology, feature, dateState, reportType }) => {
  const groupBy = 'test_date'
  const { startDate, endDate } = dateState
  const [queryString, setQueryString] = useState(buildQueryString({
    technology,
    feature,
    startDate,
    endDate,
    excludeSpecial: false
  }))
  const tableType = reportType === CTP ? CTP : 'FIELDTEST'
  const [isLoading, queryResults] = useFetchRafael(getArchiveFilterParams(queryString, groupBy), [])

  useEffect(() => {
    const newQueryString = buildQueryString({
      technology,
      feature,
      startDate,
      endDate,
      excludeSpecial: false
    })
    setQueryString(newQueryString)
  }, [feature, startDate, endDate])

  console.log('Rendering ReportCatalog')
  return (
    <div className="report-catalog">
      <Row className='justify-content-center'>
        <h1 className="plot-title">
          Test Reports
          <HelpTooltip title="Device Color Legend" content={<TooltipContent />}/>
        </h1>
          <Suspense fallback={<Spinner visible />}>
            <ResultsTable
              technology={technology}
              feature={feature}
              results={queryResults}
              type={tableType}
            />
          </Suspense>
      </Row>
      <Spinner visible={isLoading} />
    </div>
  )
}

export default React.memo(ReportCatalog)