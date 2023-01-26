/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Text } from '@tidbits/react-tidbits'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import HelpTooltip from '../../../Widgets/HelpTooltip'
import Box from '../../../Box'

const SingleHeadRowMultileTables = lazy(() => import('../SingleHeadRowMultileTables'))
const EmbeddedMap = lazy(() => import('../../../Plots/EmbeddedMap'))
const TimeSeries = lazy(() => import('../../../Plots/TimeSeries'))

const technology = "ROUTINE"

const RoutineDeviceDetails = ({
  feature,
  archive,
  tab
}) => {

  console.log('Rendering RoutineDeviceDetails')
  return (
    <>
      {tab === 'Tables' && (
        <SingleHeadRowMultileTables feature={feature} archive={archive} />
      )}
      {tab === 'Map' && (
        <Row>
          <Col className="box report-plot">
            <h1 className="plot-title" style={{ marginTop: '25px' }}>Map View</h1>
            <Suspense fallback={<Spinner visible />}>
              <EmbeddedMap technology={technology} feature={feature} archive={archive} />
            </Suspense>
          </Col>
        </Row>
      )}
      {tab === 'Time Series' && (
        <Row>
          <Col className="box report-plot">
            <h1 className="plot-title" style={{ marginTop: '25px' }}>
              Time Series Plots
              <HelpTooltip title="Tips" content={<Text>Click and drag on plots to zoom</Text>} />
            </h1>
            <Suspense fallback={<Spinner visible />}>
              <TimeSeries technology={technology} feature={feature} archives={[archive]} />
            </Suspense>
          </Col>
        </Row>
      )}
    </>
  )
}

export default React.memo(RoutineDeviceDetails)
