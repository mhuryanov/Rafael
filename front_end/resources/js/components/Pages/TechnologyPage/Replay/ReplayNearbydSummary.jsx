/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { Navigation, NavigationItem } from '@dx/continuum-navigation'

import Filter from '../../../Widgets/Filter'

const SummaryTable = lazy(() => import('../../../Tables/SummaryTable'))
const MultiTableCdfPlots = lazy(() => import('../../../Plots/Cdf/MultiTableCdfPlots'))

const technology = "REPLAY"

const ReplayNearbydSummary = ({
  feature,
  archives
}) => {
  const archiveIds = archives.map(archive => archive.id)
  
  const completedDevices = archives.map(archive => archive.model_hardware)
  const completedBuildTrains = archives.map(archive => archive.build_train)
  const [filters, setFilters] = useState({
    archiveIds,
    devices: completedDevices,
    buildTrains: completedBuildTrains,
    customFilters: {},
  })

  console.log(`Rendering Replay/${feature} Summary`)
  return (
    <>
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
      <MultiTableCdfPlots
        archives={archives}
        technology={technology}
        feature={feature}
        filters={filters}
      />
    </>
  )
}

export default React.memo(ReplayNearbydSummary)
