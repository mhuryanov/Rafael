/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { useState, useEffect, Suspense, lazy } from 'react'
import { Row, Col } from 'react-bootstrap'
import {
  Redirect,
  useParams
} from 'react-router-dom'
import { SegmentedButton } from '@dx/continuum-segmented-button'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import { FeatureProvider } from './FeatureContext'
import { FIELDTEST_API } from '../../../utilities/constants'
import { isValidPipelineState, isValidBuildTrain, getDeviceName } from '../../../utilities/helpers'
import { useFetchRafael } from '../../../hooks/fetchData'
import TechnologySummary from './TechnologySummary'

const ArchivePieChart = lazy(() => import('../../Plots/ArchivePieChart'))

const _ = require('underscore')


const FieldTestReport = () => {
  const { technology: urlTechnology, feature: urlFeature, fieldTestId } = useParams()
  const technology = urlTechnology.toUpperCase()
  const feature = urlFeature.toUpperCase()
  const [fieldTestState, setFieldTestState] = useState({
    testName: '',
    testDate: '',
    allSegments: [],
    allArchives: [],
    completedArchives: []
  })
  const [selectedSegment, setSelectedSegment] = useState('')
  const [isLoading, fieldTestData] = useFetchRafael({ url: FIELDTEST_API + fieldTestId }, [])
  const {
    testName,
    testDate,
    allSegments,
    allArchives,
    completedArchives
  } = fieldTestState
  const { errorMessage } = fieldTestData

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const {
        name: newName,
        test_date: newDate,
        segments = [],
        archives: newAllArchives
      } = fieldTestData
      const newAllSegments = (
        segments.length > 0
          ? segments.map(segment => segment.name.toUpperCase())
          : []
      )
      const newCompletedArchives = newAllArchives
        .filter(archive => (
          isValidPipelineState(archive.pipelinestate)
          && isValidBuildTrain(archive.build_train)
        )).map(archive => {
          archive['fieldtest_name'] = newName
          archive['test_date'] = newDate
          return archive
        }).sort((a, b) => getDeviceName(a) > getDeviceName(b))
      setFieldTestState(prevState => ({
        ...prevState,
        testName: newName,
        testDate: newDate,
        allSegments: newAllSegments,
        allArchives: newAllArchives,
        completedArchives: newCompletedArchives
      }))
      setSelectedSegment(newAllSegments[0] || '')
    }
  }, [isLoading, errorMessage, fieldTestData])

  const handleNavClick = (value) => {
    setSelectedSegment(value)
  }
  
  if (errorMessage) {
    return <Redirect to="/error" />
  }

  if (isLoading || allArchives.length === 0) {
    return <div className="spinner-gray"><Spinner visible /></div>
  }

  console.log('Rendering FieldTestReport')
  return (
    <FeatureProvider technology={technology} feature={feature}>
      <Suspense fallback={<div className="spinner-gray"><Spinner visible /></div>}>
        <h1 className="dashboard-title">{`${testName} (${testDate})`}</h1>
        {technology === 'GNSS' && (allSegments.length > 0 ? (
          <div>
            <div className="tab-header">Segment</div>
            <SegmentedButton 
              segments={allSegments}
              onChange={handleNavClick}
              active={selectedSegment}
            />
          </div>
        ) : (
          <div>No Segments Found. Please Check Dataset.</div>
        ))}
        <TechnologySummary
          technology={technology}
          feature={feature}
          archives={completedArchives}
          options={{ segment: selectedSegment, allArchives }}
        />
        <Row className="justify-content-center">
          <Col className="box pie-chart">
            <h1 className="plot-title" style={{ marginTop: '25px' }}>Archives Status</h1>
            <Suspense fallback={<Spinner visible />}>
              <ArchivePieChart technology={technology} fieldtest={fieldTestId} dateState={{ startDate: new Date(testDate), endDate: new Date(testDate) }}/>
            </Suspense>
          </Col>
        </Row>
      </Suspense>
    </FeatureProvider>
  )
}

export default React.memo(FieldTestReport)
