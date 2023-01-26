/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Text } from '@tidbits/react-tidbits'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import HelpTooltip from '../../../Widgets/HelpTooltip'

const TimeSeries = lazy(() => import('../../../Plots/TimeSeries'))

const technology = "GNSS"


const TTFFDeviceDetails = ({
  feature,
  archive,
  tab
}) => {

  console.log('Rendering TTFFDeviceDetails')
  return (
    <>
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

export default React.memo(TTFFDeviceDetails)
