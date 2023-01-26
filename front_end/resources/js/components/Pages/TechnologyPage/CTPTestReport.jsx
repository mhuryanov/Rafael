/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import Filter from '../../Widgets/Filter'
import Box from '../../Box'
import { CTP, FITNESS_FEATURES, CTP_REPORT_TABLE} from '../../../utilities/constants'
import { TooltipContent } from './E911/E911DeviceDetails'
import HelpTooltip from '../../Widgets/HelpTooltip'
import HiddenBox from '../../HiddenBox'

const SummaryTable = lazy(() => import('../../Tables/SummaryTable'))

const _ = require('underscore')

const ALL_CTP_GROUPS = ['General', 'L5', 'MapMatcher', 'Odometer2.0', 'Smoother2.0','Raven', 'RavenWatch', 'MAPS377',
'5G-CellPositioning']

const getCTPGroups = (technology, feature) => {
  switch (true) {
    case technology === 'GNSS' && FITNESS_FEATURES.includes(feature):
      return feature === 'MAPS377' ? ['MAPS377'] : ALL_CTP_GROUPS.slice(0, -1)
    case technology === 'GNSS' && feature === 'DRIVE':
      return ['General', 'L5', 'Raven', 'RavenWatch', '5G-CellPositioning']
    default:  // GNSS TTFF
      return []
  }
}

const CTPTestReport = ({
  technology,
  feature,
  archives,
}) => {
  const { tableNameColumn } = CTP_REPORT_TABLE
  const completedDevices = _.uniq(archives.map(archive => archive.model_hardware))
  const completedBuildTrains = _.uniq(archives.map(archive => archive.build_train))
  const [filters, setFilters] = useState({
    archiveIds: archives.map(archive => archive.id),
    devices: completedDevices,
    buildTrains: completedBuildTrains,
  })
  const CTP_GROUPS = getCTPGroups(technology, feature)

  console.log('Rendering CTPTestReport')
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
      {CTP_GROUPS.map((table, idx) => (
        <div key={table}>
          {idx == 0 && (<Row>
              <Col className="box report-table">
                <h1 className="plot-title" style={{ marginTop: '25px' }}>{table}</h1>
                <Row className='justify-content-center zero-margin'>
                  <Suspense fallback={<Spinner visible />}>
                    <SummaryTable
                      feature={feature}
                      archives={archives}
                      technology={technology}
                      filters={{
                        ...filters,
                        customFilters: {
                          [tableNameColumn]: table,
                          table_name: table,
                        }
                      }}
                      setFilters={setFilters}
                      reportType={CTP}
                    />
                  </Suspense>
                </Row>
              </Col>
            </Row>
          )}
          {idx != 0 && (<Row>
              <HiddenBox title={table} type="report-table no-min">
                <Suspense fallback={<Spinner visible />}>
                  <SummaryTable
                    feature={feature}
                    archives={archives}
                    technology={technology}
                    filters={{
                      ...filters,
                      customFilters: {
                        [tableNameColumn]: table,  // For isValidArchiveData, check if archive["group"] contains expected table
                        table_name: table,  // For getCategoryMapping which use table_name variable to cut index
                      }
                    }}
                    setFilters={setFilters}
                    reportType={CTP}
                  />
                </Suspense>
              </HiddenBox>
            </Row>
          )}
        </div>
      ))}
    </>
  )
}

CTPTestReport.propTypes = {
  archives: PropTypes.array.isRequired
}

export default React.memo(CTPTestReport)
