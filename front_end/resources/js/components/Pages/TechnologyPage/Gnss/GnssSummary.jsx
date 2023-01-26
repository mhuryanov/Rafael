/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Row, Col
} from 'react-bootstrap'
import { SegmentedButton } from '@dx/continuum-segmented-button'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import Filter from '../../../Widgets/Filter'
import { KPI_NAMES, DEFAULT_KPIS } from '../../../../utilities/constants'
import MetaKeySelection from '../MetaKeySelection'
import HiddenBox from '../../../HiddenBox'

const SummaryTable = lazy(() => import('../../../Tables/SummaryTable'))
const CdfPlot = lazy(() => import('../../../Plots/Cdf'))
const MultiTimeSeries = lazy(() => import('../../../Plots/MultiTimeSeries'))
const NmeaSubPage = lazy(() => import('../NMEASubPage'))
const DeviceCrashes = lazy(() => import('../DeviceCrashes'))

const _ = require('underscore')
const technology = "GNSS"

const allKpis = Object.keys(KPI_NAMES.GNSS)

const getGroups = (source, feature) => {
  switch (true) {
    case source === 'Raven':
      return ['Overall Measurement Count', 'LOS HMM Selection Count', 'PNT Measurement Statistics L1', 'PNT Measurement Statistics L5'] 
    case source === 'CL Pos':
      return (['WALK', 'BIKE', 'RUN'].includes(feature)) ? ['Reroute Statistics', 'Cell Data Usage Statistics', 'Mapmatcher and Smoother KPI'] : ['Reroute Statistics', 'Cell Data Usage Statistics']
    default:  
      return []
  }
}

const GnssSummary = ({
  feature,
  archives,
  segment
}) => {
  const archiveIds = archives.map(archive => archive.id)
  const completedDevices = _.uniq(archives.map(archive => archive.model_hardware))
  const completedBuildTrains = _.uniq(archives.map(archive => archive.build_train))
  const tabs = archives.length > 0 ? ['CL Pos', 'GPSSA (Vendor)', 'Raven', 'WiFi', 'WiFi2']: []
  const [source, setSource] = useState(tabs[0])
  const CUR_GROUPS = getGroups(source, feature)
  const [filters, setFilters] = useState({
    archiveIds,
    devices: completedDevices,
    buildTrains: completedBuildTrains,
    kpis: [...DEFAULT_KPIS.GNSS, 'odometer_distance_error_rate']
  })

  useEffect(() => {
    const defaultSegment = feature === 'DRIVE' ? 'ENTIREDRIVE' : ''
    setFilters(prevFilters => ({
      ...prevFilters,
      customFilters: { segment: segment || defaultSegment, source }
    }))
  }, [segment, source])


  console.log('Rendering GnssSummary')
  return (
    <>
      {tabs.length > 0 && <div className="tab-header">Source</div>}
      <SegmentedButton 
        segments={tabs}
        onChange={(value) => setSource(value)}
        active={source}
      />
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
        <Col className="fieldtest-filter">
          <Filter		
            title="Filter by KPI"		
            type="kpis"		
            items={allKpis}		
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
              <SummaryTable
                feature={feature}
                archives={archives}
                technology={technology}
                filters={{
                  ...filters,
                  customFilters: {
                    ...filters.customFilters,
                    table_name: '',
                  }
                }}
                setFilters={setFilters}
              />
            </Suspense>
          </Row>
        </Col>
      </Row>
      {CUR_GROUPS.map((table, idx) => (
        <div key={table}>
          <Row>
            <HiddenBox title={table} type="report-table no-min">
              <Suspense fallback={<Spinner visible />}>
                <SummaryTable
                  feature={feature}
                  archives={archives}
                  technology={technology}
                  filters={{
                    ...filters,
                    customFilters: {
                      ...filters.customFilters,
                      table_name: table,
                    }
                  }}
                  setFilters={setFilters}
                />
              </Suspense>
            </HiddenBox>
          </Row>
        </div>
      ))}
      <Row>
        <Col className="box report-plot">
          <h1 className="plot-title" style={{ marginTop: '25px' }}>CDF</h1>
          <Row className='justify-content-center zero-margin'>
            <Suspense fallback={<Spinner visible />}>
              <CdfPlot
                archives={archives}
                technology={technology}
                feature={feature}
                filters={filters}
                title={`${source}, ${segment}`}
              />
            </Suspense>
          </Row>
        </Col>
      </Row>
      <DeviceCrashes archives={archives} />
      <Row>
        <HiddenBox title="Time Series" type="time-series-plo">
            <MultiTimeSeries
              archives={archives}
              technology={technology}
              feature={feature}
              filters={filters}
              allKpis={allKpis}
              title={`${source}, ${segment}`}
            />
        </HiddenBox>
      </Row>
      <NmeaSubPage
        technology={technology}
        feature={feature}
        archives={archives}
        filters={filters}
        setFilters={setFilters}
        segment={segment}
      />
    </>
  )
}

GnssSummary.propTypes = {
  archives: PropTypes.array.isRequired
}

export default React.memo(GnssSummary)
