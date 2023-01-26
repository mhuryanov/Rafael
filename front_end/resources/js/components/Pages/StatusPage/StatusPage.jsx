/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { useContext, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Suspense, lazy } from 'react'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { Navigation, NavigationItem } from '@dx/continuum-navigation'

import { StateContext } from '../../StateContext'
import { filterProcessedTechnologies, getTechnologiesToShow, isUserAdmin } from '../../../utilities/helpers'

const PipelineDashboard = lazy(() => import('./PipelineDashboard'))
const DirectoryBody = lazy(() => import('./DirectoryBody'))
const TasksList = lazy(() => import('./TasksList'))
const JobsStatus = lazy(() => import('./JobsStatus'))

const TABS = isUserAdmin() ? ['Pipeline Health', 'Tasks Status', 'Jobs Status',] : ['Pipeline Health', 'Tasks Status',]

const StatusPage = () => {
  const { userPreferences } = useContext(StateContext)
  const { technologyPreferences } = userPreferences
  const allTechnologies = getTechnologiesToShow(technologyPreferences)
  const [selectedTab, setSelectedTab] = useState(TABS[0])

  console.log('Rendering StatusPage')

  return (
    <Row className="page-container">
      <Col lg="2" md="2" sm="2" style={{ minWidth: '320px', maxWidth: '350px', borderRight: '1px solid lightgray' }}>
        <Suspense fallback={<Spinner visible />}>
          <DirectoryBody />
        </Suspense>
      </Col>
      <Col lg="9" md="9" sm="9">
        <Suspense fallback={<Spinner visible />}>
          <Navigation direction='horizontal'>
            {TABS.map(tab => (
              <NavigationItem
                key={tab}
                variant="tab"
                onClick={() => setSelectedTab(tab)}
                active={tab === selectedTab}
              >
                {tab}
              </NavigationItem>
            ))}
          </Navigation>
          {selectedTab === 'Pipeline Health' && (
            <PipelineDashboard technologies={filterProcessedTechnologies(allTechnologies)} />
          )}
          {selectedTab === 'Tasks Status' && (
            <TasksList />
          )}
          {selectedTab === 'Jobs Status' && (
            <JobsStatus />
          )}

        </Suspense>
      </Col>
    </Row>
  )
}

export default React.memo(StatusPage)