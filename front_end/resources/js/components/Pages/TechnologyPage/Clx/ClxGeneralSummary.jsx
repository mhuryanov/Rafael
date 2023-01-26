/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { Navigation, NavigationItem } from '@dx/continuum-navigation'

import Filter from '../../../Widgets/Filter'
import MetaKeySelection from '../MetaKeySelection'

const DeviceCrashes = lazy(() => import('../DeviceCrashes'))
const SummaryTable = lazy(() => import('../../../Tables/SummaryTable'))

const technology = "CLX"

const ClxGeneralSummary = ({
  feature,
  archives
}) => {
  const archiveIds = archives.map(archive => archive.id)
  
  const completedDevices = archives.map(archive => archive.model_hardware)
  const completedBuildTrains = archives.map(archive => archive.build_train)
  const [filters, setFilters] = useState({
    archiveIds,
    devices: completedDevices,
    buildTrains: completedBuildTrains
  })

  console.log(`Rendering CLX/${feature} Summary`)
  return (
    <>
      <Row>
        <Col className="fieldtest-filter">
          <Filter
            title="Filter by Device"
            type="devices"
            items={completedDevices}
            filters={filters}
            setFilters={setFilters}
          />
        </Col>
        <Col className="fieldtest-filter">
          <Filter
            title="Filter by Build"
            type="buildTrains"
            items={completedBuildTrains}
            filters={filters}
            setFilters={setFilters}
          />
        </Col>
        <MetaKeySelection technology={technology} feature={feature} archives={archives} />
      </Row>
      <Row>
        <Col className="box report-table">
          <h1 className="plot-title" style={{ marginTop: '25px' }}>Summary Report</h1>
          <Row className='justify-content-center zero-margin'>
            <Suspense fallback={<Spinner visible />}>
              <SummaryTable feature={feature} archives={archives} technology={technology} filters={filters} setFilters={setFilters} />
            </Suspense>
          </Row>
        </Col>
      </Row>
      <DeviceCrashes archives={archives} />
    </>
  )
}

export default React.memo(ClxGeneralSummary)
