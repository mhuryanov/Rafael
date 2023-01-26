/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { useEffect, useState, useContext, Suspense, lazy } from 'react'
import { Row, Col } from 'react-bootstrap'
import {
  useParams,
  useHistory,
} from 'react-router-dom'
import { Navigation, NavigationItem } from '@dx/continuum-navigation'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import { getPreviousDate, useCurrentUrl, getFavoriteByUrl } from '../../../utilities/helpers'
import ReportCatalog from './ReportCatalog'
import DateRange from '../../Widgets/DateRange'
import { StateContext } from '../../StateContext'
import { NO_PROCESSING, DEFAULT_REPORT_TYPE, PERFORMANCE, CTP } from '../../../utilities/constants'
import { FeatureProvider } from './FeatureContext'
import CTPTrend from './CTPTrend'

const ZaxisTrend = lazy(() => import('./Livability/ZaxisTrend'))
const EraTrend = lazy(() => import('./Livability/EraTrend'))
const AggregatedStatistics  = lazy(() => import('./AggregatedStatistics'))
const ClxTrends  = lazy(() => import('./Clx/ClxTrends'))
const AwdPage  = lazy(() => import('./Awd/AwdPage'))
const ReplayMicrolocationTrends = lazy(() => import('./Replay/ReplayMicrolocationTrends'))

const ALL_TABS = [PERFORMANCE, CTP]


const TechnologyTrend = ({technology, feature, dateState }) => {
  switch (true) {
    case technology === 'LIVABILITY' && feature === 'ZAXIS':
      return (
          <ZaxisTrend technology={technology} feature={feature} dateState={dateState} />
      )
    case technology === 'LIVABILITY' && feature === 'ERA':
      return (
          <EraTrend technology={technology} feature={feature} dateState={dateState} />
      )
    case technology === 'CLX' && feature === 'TRENDS':
      return (
          <ClxTrends key={technology + feature} technology={technology} dateState={dateState} feature={feature} />
      )
    case technology === 'REPLAY' && feature === 'MICROLOCATION':
      return (
          <ReplayMicrolocationTrends key={technology + feature} technology={technology} dateState={dateState} feature={feature} />
      )
    case technology === 'GNSS' || technology === 'E911':
    case technology === 'CLX' && feature === 'GEOFENCING':
      return (
          <AggregatedStatistics key={technology + feature} technology={technology} dateState={dateState} feature={feature} />
      )
    default:
      return null
  }
}


const TechnologyDashboard = () => {
  const history = useHistory()
  const currentUrl = useCurrentUrl()
  const {
    technology: urlTechnology,
    feature: urlFeature,
    reportType = DEFAULT_REPORT_TYPE
  } = useParams()
  const technology = urlTechnology.toUpperCase()
  const feature = urlFeature.toUpperCase()
  const { userPreferences } = useContext(StateContext)
  const { dateRangePreferences, favorites } = userPreferences
  const { name: favoriteName }= getFavoriteByUrl(favorites, currentUrl)
  const [dateState, setDateState] = useState({ // special case for AWD, might refactor later
    dateRange: technology !== 'AWD' ? dateRangePreferences : { label: 'Custom Range', value: 'custom' },
    startDate: technology !== 'AWD' ? getPreviousDate(dateRangePreferences.value) : null,
    endDate: null,
    dateGroup: { label: 'Default', value: null }
  })
  const defaultName = `${feature} ${reportType} Dashboard`

  const handleSelectTab = (tab) => {
    history.push(`/technology/${technology}/${feature}/${tab}`)
  }

  console.log('Rendering TechnologyDashboard')
  return (
    <FeatureProvider technology={technology} feature={feature}>
      <Suspense fallback={<div className="spinner-gray"><Spinner visible /></div>}>
        <h1 className="dashboard-title">
          {favoriteName || defaultName}
        </h1>
        {technology === 'GNSS' && (
          <Navigation className="dashboard-tabs" direction='horizontal'>
            {ALL_TABS.map(tab => (
              <NavigationItem
                key={tab} 
                variant="tab"
                onClick={() => handleSelectTab(tab)}
                active={reportType === tab}
              >
                {tab}
              </NavigationItem>
            ))}
          </Navigation>
        )}
        <Row>
          <DateRange
            dateState={dateState}
            setDateState={setDateState}
            showDateGroup={technology === 'ZAXIS'}
          />
        </Row>
        {technology === 'AWD' && <AwdPage key={feature} feature={feature} dateState={dateState} />}
        {reportType === PERFORMANCE && <TechnologyTrend technology={technology} feature={feature} dateState={dateState} />}
        {reportType === CTP && <CTPTrend key={technology + feature} technology={technology} feature={feature} dateState={dateState} />}
        {(!NO_PROCESSING.includes(technology) && !(technology === 'CLX' && feature === 'TRENDS')) && (
          <Row>
            <Col className="box report-catalog-container">
              <ReportCatalog
                key={technology + feature}
                technology={technology}
                feature={feature}
                dateState={dateState}
                reportType={reportType}
              />
            </Col>
          </Row>
        )}
      </Suspense>
    </FeatureProvider>
  )
}

export default React.memo(TechnologyDashboard)
