/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { useState, useContext } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Suspense, lazy } from 'react';
import {
  Route,
  Switch,
  Redirect,
  useParams
} from 'react-router-dom'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import { StateContext } from '../../StateContext'
import FeatureList from './FeatureList'

const TechnologyDashboard = lazy(() => import('./TechnologyDashboard'))
const CustomQueryReport = lazy(() => import('./CustomQueryReport'))
const FieldTestReport = lazy(() => import('./FieldTestReport'))
const ClxTrendsReport = lazy(() => import('./Clx/ClxTrendsReport'))
const DeviceDetails = lazy(() => import('./DeviceDetails'))

const TechnologyPage = () => {
  const { technology: urlTechnology } = useParams()
  const technology = urlTechnology.toUpperCase()
  const { technologyFeatures } = useContext(StateContext)
  
  if (!(technology in technologyFeatures)) {
    return <Redirect to="/error" />
  }

  const features = (
    technologyFeatures[technology].length > 0
      ? technologyFeatures[technology]
      : ['']
  )
  const selectedFeature = features[0]

  console.log('Rendering TechnologyPage')
  return (
    <Row className="page-container">
      <Switch>
        <Route exact path={`/technology/:technology`}>
          <Redirect to={`/technology/${technology}/${selectedFeature}`} />
        </Route>
        <Route path={`/technology/:technology/:feature/:reportType?`}>
          <Col style={{ maxWidth: '275px', minWidth: '275px' }}>
            <FeatureList />
          </Col>
          <Col style={{ marginTop: '-40px', minWidth: '600px', marginRight:'10px' }}>
            <Switch>
              <Route exact path={`/technology/:technology/:feature/:reportType?/report/:jobName/:reportDate`}>
                <Suspense fallback={<div className="spinner-gray"><Spinner visible /></div>}>
                  <ClxTrendsReport />
                </Suspense>
              </Route>
              <Route exact path={`/technology/:technology/:feature/:reportType?/report/q`}>
                <Suspense fallback={<div className="spinner-gray"><Spinner visible /></div>}>
                  <CustomQueryReport />
                </Suspense>
              </Route>
              <Route exact path={`/technology/:technology/:feature/:reportType?/report/:fieldTestId`}>
                <Suspense fallback={<div className="spinner-gray"><Spinner visible /></div>}>
                  <FieldTestReport />
                </Suspense>
              </Route>
              <Route exact path={`/technology/:technology/:feature/:reportType?/device/:archiveId`}>
                <Suspense fallback={<div className="spinner-gray"><Spinner visible /></div>}>
                  <DeviceDetails />
                </Suspense>
              </Route>
              <Route path={`/technology/:technology/:feature/:reportType?`}>
                <Suspense fallback={<div className="spinner-gray"><Spinner visible /></div>}>
                  <TechnologyDashboard />
                </Suspense>
              </Route>
              <Route render={() => <Redirect to="/error" />} />
            </Switch>
          </Col>
        </Route>
        <Route render={() => <Redirect to="/error" />} />
      </Switch>
    </Row>
  )
}

export default React.memo(TechnologyPage)
