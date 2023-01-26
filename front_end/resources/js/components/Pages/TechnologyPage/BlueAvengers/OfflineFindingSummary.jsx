/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import Filter from '../../../Widgets/Filter'


const DeviceCrashes = lazy(() => import('../DeviceCrashes'))
const SummaryTable = lazy(() => import('../../../Tables/SummaryTable'))
const MultiTableCdfPlots = lazy(() => import('../../../Plots/Cdf/MultiTableCdfPlots'))

const _ = require('underscore')

const technology = "BA"

const OfflineFindingSummary = ({
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

  console.log('Rendering OfflineFindingSummary')
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
      <MultiTableCdfPlots
        archives={archives}
        technology={technology}
        feature={feature}
        filters={filters}
      />
    </>
  )
}

export default React.memo(OfflineFindingSummary)
