import React, { useState, useContext } from 'react'
import { Suspense, lazy } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import { StateContext } from '../../StateContext'
import { getPreviousDate } from '../../../utilities/helpers'

const DateRange = lazy(() => import('../../Widgets/DateRange'))
const ArchivePieChart = lazy(() => import('../../Plots/ArchivePieChart'))


const PipelineDashboard = ({ technologies }) => {
  const { userPreferences } = useContext(StateContext)
  const { dateRangePreferences } = userPreferences
  const [dateState, setDateState] = useState({
    dateRange: dateRangePreferences,
    startDate: getPreviousDate(dateRangePreferences.value),
    endDate: null
  })

  console.log('Rendering PipelineDashboard')
  return (
    <Suspense fallback={<div className="spinner-gray"><Spinner visible /></div>}>
      <h1 className="dri-dashboard-title"> Pipeline Dashboard </h1>
      <Row className='justify-content-center'>
        <DateRange dateState={dateState} setDateState={setDateState} />
      </Row>
      <Row className='justify-content-center' style={{paddingBottom: '100px'}}>
        {technologies.map((driTechnology) => (
          <Col lg="5" md="5" sm="5" key={driTechnology} className="box pie-chart" >
            <h1 className="plot-title" style={{ marginTop: '25px' }}>{driTechnology}</h1>
            <ArchivePieChart
              technology={driTechnology}
              dateState={dateState}
            />
          </Col>
        ))}
      </Row>
    </Suspense>
  )
}

export default React.memo(PipelineDashboard)