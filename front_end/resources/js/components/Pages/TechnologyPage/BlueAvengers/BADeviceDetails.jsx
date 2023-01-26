/* eslint-disable react/prop-types */
import React, { Suspense, lazy } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

const EmbeddedMap = lazy(() => import('../../../Plots/EmbeddedMap'))
const DeviceCrashes = lazy(() => import('../DeviceCrashes'))
const technology = "BA"

const BADeviceDetails = ({
  feature,
  archive,
  tab
}) => {

  return (
    <>
      {tab === 'Map' && (
        <Row>
          <Col className="box">
            <h1 className="plot-title" style={{ marginTop: '25px' }}>Map View</h1>
            <Suspense fallback={<Spinner visible />}>
              <EmbeddedMap technology={technology} feature={feature} archive={archive} />
            </Suspense>
          </Col>
        </Row>
      )}
      {tab === 'Crashes' && (
        <DeviceCrashes archives={[archive]} />
      )}
    </>
  )
}

export default React.memo(BADeviceDetails)
