/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Text } from '@tidbits/react-tidbits'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import HelpTooltip from '../../../Widgets/HelpTooltip'
import WsbPlots from './WsbPlots'

const DeviceCrashes = lazy(() => import('../DeviceCrashes'))
const EmbeddedMap = lazy(() => import('../../../Plots/EmbeddedMap'))
const TimeSeries = lazy(() => import('../../../Plots/TimeSeries'))

const technology = "CLX"
const TABS = [
  'Map',
  'Time Series'
]

const ClxGFDeviceDetails = ({
  feature,
  archive,
  tab
}) => {

  console.log('Rendering ClxGFDeviceDetails')
  return (
    <>
      {tab === 'Geofencing Map' && (
        <Row>
          <Col className="box report-plot">
            <h1 className="plot-title" style={{ marginTop: '25px' }}>Map View</h1>
            <Suspense fallback={<Spinner visible />}>
              <EmbeddedMap technology={technology} feature="GEOFENCING" archive={archive} />
            </Suspense>
          </Col>
        </Row>
      )}
      {tab === 'Geofencing Time Series' && (
        <Row>
          <Col className="box report-plot">
            <h1 className="plot-title" style={{ marginTop: '25px' }}>
              Time Series Plots
              <HelpTooltip title="Tips" content={<Text>Click and drag on plots to zoom</Text>} />
            </h1>
            <Suspense fallback={<Spinner visible />}>
              <TimeSeries technology={technology} feature="GEOFENCING" archives={[archive]} />
            </Suspense>
          </Col>
        </Row>
      )}
      {tab === 'WSB Map' && (
        <Row>
          <Col className="box report-plot">
            <h1 className="plot-title" style={{ marginTop: '25px' }}>Map View</h1>
            <Suspense fallback={<Spinner visible />}>
              <EmbeddedMap technology={technology} feature="WSB" archive={archive} />
            </Suspense>
          </Col>
        </Row>
      )}
      {tab === 'WSB Plots' && (
        <WsbPlots archive={archive} />
      )}
      {tab === 'Crashes' && (
         <DeviceCrashes archives={[archive]} />
      )}
    </>
  )
}

export default React.memo(ClxGFDeviceDetails)
