/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { StatePanel } from '@dx/continuum-state-panel'
import { Navigation, NavigationItem } from '@dx/continuum-navigation'

import { useFetchArchiveData } from '../../../../hooks/fetchData'
import { isEmpty, addToObject, createArchiveLabels } from '../../../../utilities/helpers'
import { SUMMARY_TABLE, ARCHIVE_REPORTING_LOGS } from '../../../../utilities/constants'

const SummaryTable = lazy(() => import('../../../Tables/SummaryTable'))
const DeviceCrashes = lazy(() => import('../DeviceCrashes'))

const _ = require('underscore')

const technology = "BA"
const feature = "LKL"


const LklSummary = ({
  archives,
}) => {
  const archiveIds = archives.map(archive => archive.id)
  const { tableName, tableNameColumn, tabColumn } = SUMMARY_TABLE[technology][feature]
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, tableName)
  const [tabMapping, setTabMapping] = useState({})
  const [selectedTab, setSelectedTab] = useState('')
  const completedDevices = _.uniq(archives.map(archive => archive.model_hardware))
  const completedBuildTrains = _.uniq(archives.map(archive => archive.build_train))
  const [filters, setFilters] = useState({
    archiveIds: archives.map(archive => archive.id),
    devices: completedDevices,
    buildTrains: completedBuildTrains
  })
  const { errorMessage } = archivesInfo
  
  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const newTabMapping = {}
      Object.entries(archivesInfo).forEach(([archiveId, archiveData]) => {
        if (!isEmpty(archiveData)) {
          const tableNames = archiveData[tableNameColumn]
          const tabs = archiveData[tabColumn]
          tabs.forEach((tab, i) => {
            const tableName = tableNames[i]
            addToObject(newTabMapping, tab, [tableName])
          })
        }
      })
      Object.entries(newTabMapping).forEach(([tab, tableNames]) => {
        newTabMapping[tab] = _.uniq(tableNames)
      })
      setSelectedTab(Object.keys(newTabMapping)[0])
      setTabMapping(newTabMapping)
    }
  }, [isLoading, errorMessage, archivesInfo])

  console.log('Rendering LklSummary')
  return (
    <>
      <Navigation direction='horizontal'>
        {Object.keys(tabMapping).map(tab => (
          <NavigationItem
            key={tab} 
            variant="tab"
            onClick={() => setSelectedTab(tab)}
            active={selectedTab === tab}
          >
            {tab}
          </NavigationItem>
        ))}
      </Navigation>
      {isEmpty(tabMapping) && (
        <Col className="box">
          <StatePanel message="No data to show." suggestion="Data may still be processing." />
        </Col>
      )}
      {selectedTab && tabMapping[selectedTab].map(table => (
        <div key={table}>
          <Row>
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
                        [tableNameColumn]: table
                      }
                    }}
                    setFilters={setFilters}
                  />
                </Suspense>
              </Row>
            </Col>
          </Row>
        </div>
      ))}
      <div className="spinner-gray"><Spinner visible={isLoading && !errorMessage} /></div>
      <DeviceCrashes archives={archives} />
    </>
  )
}

LklSummary.propTypes = {
  archives: PropTypes.array.isRequired
}

export default React.memo(LklSummary)
