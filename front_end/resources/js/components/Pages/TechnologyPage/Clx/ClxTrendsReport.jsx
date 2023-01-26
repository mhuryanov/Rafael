/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { useState, useEffect, Suspense, lazy } from 'react'
import {
  Redirect,
  useParams
} from 'react-router-dom'
import {
  Row, Col
} from 'react-bootstrap'
import { Text } from '@tidbits/react-tidbits'
import Box from '../../../Box'
import HelpTooltip from '../../../Widgets/HelpTooltip'
import { isEmpty } from '../../../../utilities/helpers'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { useFetchArchiveDataQuery } from '../../../../hooks/fetchData'
import { CUSTOM_LOGS } from '../../../../utilities/constants'
import { FeatureProvider } from '../FeatureContext'
import ClxTrendsSummaryTable from '../../../Tables/SummaryTable/ClxTrendsSummaryTable'
import TimeSeriesDailyStatus from '../../../Plots/TimeSeriesDailyStatus'

const _ = require('underscore')

const ClxTrendsReport = () => {
  const { technology: urlTechnology, feature: urlFeature, jobName: jobName, reportDate: reportDate } = useParams()
  const technology = urlTechnology.toUpperCase()
  const feature = urlFeature.toUpperCase()
  const errorMessage = null
  const archives= ['091b7822-9e15-11eb-bdbe-6805ca5ce5b8']
  const [filters, setFilters] = useState({}) // reserved for future possible filters
  
  if (errorMessage) {
    return <Redirect to="/error" />
  }

  const createTimeRangeQueryString= (recentDate, days) => {
    const dateObject = new Date(recentDate)
    const endDate = dateObject.toISOString().split('T')[0]
    dateObject.setDate(dateObject.getDate()-days)
    const startDate = dateObject.toISOString().split('T')[0]
    const dateQuery = `info_date>='${startDate}' and info_date<='${endDate}'`
    return dateQuery
  }
  
  const dateQuery = createTimeRangeQueryString(reportDate, 60)
  const [isLoading, archivesInfo] = useFetchArchiveDataQuery(archives, CUSTOM_LOGS, 'job', jobName, 'r_clx_trends_plot_test', dateQuery)
  const providedColumns = {
    tableName: 'r_clx_trends_plot_test',
    columns: ['info_date', 'path', 'statistic', 'statistic', 'value', '', 'description', 'color']
  }

  console.log('Rendering ClxTrendsReport')
  return (
    <FeatureProvider technology={technology} feature={feature}>
      <Suspense fallback={<div className="spinner-gray"><Spinner visible /></div>}>
        <h1 className="dashboard-title">{`${jobName}: ${reportDate}`}</h1>
        <Row>
          <Col className="box devicel3-table">
            <h1 className="plot-title" style={{ marginTop: '25px' }}>Daily Summary Report</h1>
            <Row className='justify-content-center zero-margin'>
              <Suspense fallback={<Spinner visible />}>
                <ClxTrendsSummaryTable
                  feature={feature}
                  archives={archives}
                  technology={technology}
                  filters={filters}
                  setFilters={setFilters}
                  jobName ={jobName}
                  reportDate={reportDate}
                />
              </Suspense>
            </Row>
          </Col>
        </Row>
        {(jobName !== 'harvest_build_stats') && 
        <Row>
          <Box
            title={<>
              Detailed Plots by Path
              <HelpTooltip title="Tips" content={<Text>Click and drag on plots to zoom</Text>} />
            </>}
            isLoading={isLoading}
            type="report-plot"
          >
            {!isEmpty(archivesInfo) && (
              <Col>
                <TimeSeriesDailyStatus archives={archives} technology={technology} feature={feature} loadedData={archivesInfo} providedColumns={providedColumns}/>
              </Col>
            )}
          </Box>
        </Row>
        }
      </Suspense>
    </FeatureProvider>
  )
}

export default React.memo(ClxTrendsReport)
