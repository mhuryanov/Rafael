/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { useState, useEffect, Suspense, lazy } from 'react'
import { Row, Col } from 'react-bootstrap'
import {
  Redirect,
  useParams
} from 'react-router-dom'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import { FeatureProvider } from './FeatureContext'
import {
  useQuery,
  buildQueryString,
  getArchiveFilterParams,
  isValidPipelineState,
  isValidBuildTrain,
  getUrlQueryParams,
  dateToString,
  getDeviceName,
  getTestNamePrefix,
} from '../../../utilities/helpers'
import { useFetchRafael } from '../../../hooks/fetchData'
import ArchivePieChart from '../../Plots/ArchivePieChart'
import { FITNESS_FEATURES, DEFAULT_REPORT_TYPE, PERFORMANCE, CTP } from '../../../utilities/constants'
import TechnologySummary from './TechnologySummary'

const CTPTestReport = lazy(() => import('./CTPTestReport'))

const _ = require('underscore')

const URL_QUERY_PARAMS = [
  'testDate',
  'testName',
  'testId',
  'operator'
]


const CustomQueryReport = () => {
  const {
    technology: urlTechnology,
    feature: urlFeature,
    reportType = DEFAULT_REPORT_TYPE
  } = useParams()
  const technology = urlTechnology.toUpperCase()
  const feature = urlFeature.toUpperCase()
  const groupBy = 'archive'
  const urlQuery = useQuery()
  const {
    testDate: testDateString,
    testId: testIdString,
    testName: testNameString,
    operator
  } = getUrlQueryParams(urlQuery, URL_QUERY_PARAMS)
  const testDates = testDateString && testDateString.split(' ').map(testDate => new Date(testDate))
  const testIds = testIdString && testIdString.split(' ')
  const testNames = testNameString && testNameString.split(' ')
  let queryString = buildQueryString({
    technology,
    feature,
    excludeSpecial: true,
    testNames,
    testDates,
    testIds,
    operator,
  })
  const [reportState, setReportState] = useState({
    allArchives: [],
    completedArchives: [],
  })
  const [title, setTitle] = useState('')
  const [isLoading, reportData] = useFetchRafael(getArchiveFilterParams(queryString, groupBy), [])
  const {
    allArchives,
    completedArchives,
  } = reportState
  const { errorMessage } = reportData

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const newAllArchives = Object.values(reportData).flat()
      const newCompletedArchives = newAllArchives
        .filter(archive => (
          isValidPipelineState(archive.pipelinestate) &&
          isValidBuildTrain(archive.build_train)
        )).sort((a, b) => getDeviceName(a) > getDeviceName(b))
      setReportState(prevState => ({
        ...prevState,
        allArchives: newAllArchives,
        completedArchives: newCompletedArchives,
      }))

      let newTestNames
      if (reportType === CTP){
        newTestNames = _.uniq(newAllArchives.map(archive => {
          let name = ''
          const { fieldtest_name: testName } = archive
          name = getTestNamePrefix(testName, name)
          return `${name} (${archive.test_date})`
        }))
       } else {
        newTestNames = _.uniq(newAllArchives.map(archive => `${archive.fieldtest_name} (${archive.test_date})`))
       } 
      setTitle(newTestNames.join(', '))
    }
  }, [isLoading, errorMessage, reportData])
  
  if (errorMessage) {
    return <Redirect to="/error" />
  }

  if (isLoading || allArchives.length === 0) {
    return <div className="spinner-gray"><Spinner visible /></div>
  }

  if (allArchives.length > 100) {
    return `Report contains too many devices (${allArchives.length}). Please narrow down selection criteria to less than 100 devices.`
  }

  const fieldTestIds = _.uniq(allArchives.map(archive => archive.fieldtest))

  console.log('Rendering CustomQueryReport')
  return (
    <FeatureProvider technology={technology} feature={feature}>
      <Suspense fallback={<div className="spinner-gray"><Spinner visible /></div>}>
        <h1 className="dashboard-title" style={{ fontSize: '25px' }}>{`${title}`}</h1>
        {reportType === PERFORMANCE && (
          <TechnologySummary
            technology={technology}
            feature={feature}
            archives={completedArchives}
            options={{ fieldTestIds, allArchives }}
          />
        )}
        {reportType === CTP && (
          <CTPTestReport
            technology={technology}
            feature={feature}
            archives={completedArchives}
          />
        )}
        <Row className='justify-content-center' style={{ marginTop: '25px' }}>
          <Col className="box pie-chart">
            <h1 className="plot-title" style={{ marginTop: '25px' }}>Archives Status</h1>
            <ArchivePieChart
              technology={technology}
              feature={feature}
              testNames={testNames}
              testIds={testIds}
              testDates={testDates}
              operator={operator}
              dateState={{ dateRange: { label: testDates ? testDates.map(testDate => dateToString(testDate)).join(', ') : 'N/A' } }}
            />
          </Col>
        </Row>
      </Suspense>
    </FeatureProvider>
  )
}

export default React.memo(CustomQueryReport)
