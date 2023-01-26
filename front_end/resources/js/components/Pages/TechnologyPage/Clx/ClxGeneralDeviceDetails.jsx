/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Text } from '@tidbits/react-tidbits'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import HelpTooltip from '../../../Widgets/HelpTooltip'
import { SAL3 } from '../../../../utilities/constants'
import Box from '../../../Box'

const EmbeddedMap = lazy(() => import('../../../Plots/EmbeddedMap'))
const TimeSeries = lazy(() => import('../../../Plots/TimeSeries'))
const SummaryTable = lazy(() => import('../../../Tables/SummaryTable'))

const technology = "CLX"

const ClxGeneralDeviceDetails = ({
  feature,
  archive,
  tab
}) => {
  const [filters, setFilters] = useState({
    archiveIds: [archive.id],
    devices: [archive.model_hardware],
    buildTrains: [archive.build_train]
  })

  console.log(`Rendering CLX/${feature} DeviceDetails`)
  return (
    <>
      {tab === 'Details' && (
        <Row>
          <Box title='Detection Details' type="devicel3-table">
            <SummaryTable
              feature={feature}
              archives={[archive]}
              technology={technology}
              filters={filters}
              setFilters={setFilters}
              reportType={SAL3}
            />
          </Box>
        </Row>
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

export default React.memo(ClxGeneralDeviceDetails)
