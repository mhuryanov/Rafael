/* eslint-disable react/prop-types */
import React, { lazy, useState, Suspense } from 'react'
import { Row } from 'react-bootstrap'

import { KPI_NAMES } from '../../../utilities/constants'
import HiddenBox from '../../HiddenBox'

const SummaryTable = lazy(() => import('../../Tables/SummaryTable'))
const CdfPlot = lazy(() => import('../../Plots/Cdf'))
const MultiTimeSeriesKPIColumn = lazy(() => import('../../Plots/MultiTimeSeriesKPIColumn'))

const _ = require('underscore')


const NMEASubPage = ({
  technology,
  feature,
  archives,
  filters,
  setFilters,
  segment
}) => {

  console.log('Rendering NMEASubPage')
  return (
    <>
    <Row>
      <HiddenBox title="NMEA Summary Report" type="report-table no-min">
        <SummaryTable
          feature={feature}
          archives={archives}
          technology={technology}
          filters={filters}
          setFilters={setFilters}
          reportType="NMEA"
        />
      </HiddenBox>
    </Row>
    <Row>
      <HiddenBox title="NMEA CDF Plots" type="time-series-plo">
        <>
          {
            ["cno", "sv_tracked", "sv_used"].map((table, index) => (
              <Row key={index} className='justify-content-center zero-margin' style={{ width: '100%'}}>
                <CdfPlot
                  archives={archives}
                  technology={technology}
                  feature={feature}
                  filters={{
                    ...filters,
                    customFilters: {
                      ...filters.customFilters,
                      "additional_filter": {name: "nmea_study_name", col: "kpi_name", value: table},
                    }
                  }}
                  title={`${segment}`}
                  reportType='NMEA'
                />
              </Row>
            ))
          }
        </>
      </HiddenBox>
    </Row>
    <Row>
      <HiddenBox title="NMEA CNo Time Plots" type="time-series-plo no-min">
        <MultiTimeSeriesKPIColumn
          archives={archives}
          technology={technology}
          feature={feature}
          filters={{
            ...filters,
            customFilters: {
              ...filters.customFilters,
              "additional_filter": {name: "nmea_study_name", col: "kpi_name", value: "cno"},
            }
          }}
          allKpis={Object.keys(KPI_NAMES.NMEA.cno)}
          title={`${segment}`}
          reportType='NMEA'
        />
      </HiddenBox>
    </Row>
    </>
  )
}

export default React.memo(NMEASubPage)
