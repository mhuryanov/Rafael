/* eslint-disable react/prop-types */
import React, { Suspense, lazy } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

const GnssDeviceLevel3Summary = lazy(() => import('./GnssDeviceLevel3Summary'))
const DeviceCrashes = lazy(() => import('../DeviceCrashes'))
const EmbeddedMap = lazy(() => import('../../../Plots/EmbeddedMap'))
const StorageImages = lazy(() => import('../../../StorageImages'))

const technology = 'GNSS'

const GnssDeviceDetails = ({
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
          <StorageImages ownerUUID={archive.id}/>
        </Row>
      )}
      {tab === 'L5' && (
        <GnssDeviceLevel3Summary feature={feature} archive={archive} table_name={''} label={'L5 Antenna Statistics'}/>
      )}
      {tab === 'Cell Usage' && (
        <GnssDeviceLevel3Summary feature={feature} archive={archive} table_name={'data_usage'} label={'Cell Usage Statistics'}/>
      )}
      {tab === 'Crashes' && (
        <DeviceCrashes archives={[archive]} />
      )}
    </>
  )
}

export default React.memo(GnssDeviceDetails)
