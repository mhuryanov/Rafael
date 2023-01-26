/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { SegmentedButton } from '@dx/continuum-segmented-button'

import Filter from '../../../Widgets/Filter'
import { useFetchArchiveData } from '../../../../hooks/fetchData'
import { addToObject, isEmpty } from '../../../../utilities/helpers'
import {
  SUMMARY_TABLE,
  TTFF_TABLE_MAPPING,
  ARCHIVE_REPORTING_LOGS,
} from '../../../../utilities/constants'
import MetaKeySelection from '../MetaKeySelection'

const SummaryTable = lazy(() => import('../../../Tables/SummaryTable'))
const CdfPlot = lazy(() => import('../../../Plots/Cdf'))
const NmeaSubPage = lazy(() => import('../NMEASubPage'))

const _ = require('underscore')
const technology = "GNSS"
const feature = "TTFF"

const TTFFSummary = ({
  archives,
  segment
}) => {
  const archiveIds = archives.map(archive => archive.id)
  const { tableName, sourceColumn, tableNameColumn } = SUMMARY_TABLE[technology][feature]
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, tableName)
  const [tabs, setTabs] = useState({})
  const [selectedTab, setSelectedTab] = useState('')
  const completedDevices = _.uniq(archives.map(archive => archive.model_hardware))
  const completedBuildTrains = _.uniq(archives.map(archive => archive.build_train))
  const [filters, setFilters] = useState({
    archiveIds,
    devices: completedDevices,
    buildTrains: completedBuildTrains,
  })
  const { errorMessage } = archivesInfo
  
  useEffect(() => {
    const newTabs = {
      'CL-GPSSA (Vendor)': [],
      'CL-Unfiltered (Raw fixes)': [],
      'CL-Pos (Per Technology)': [],
      'CL-Pos (All technology - Best)': []
    }
    if (!isLoading && !errorMessage) {
      Object.values(archivesInfo).forEach(archiveData => {
        if (!isEmpty(archiveData)) {
          const sources = archiveData[sourceColumn]
          const tableNames = archiveData[tableNameColumn]
          sources.forEach((source, i) => {
            addToObject(newTabs, source, [tableNames[i]])
          })
        }
      })
      Object.keys(newTabs).forEach((newTab) => {
        newTabs[newTab] = Object.keys(TTFF_TABLE_MAPPING).filter(table => newTabs[newTab].includes(table))
      })
      setTabs(newTabs)
      setSelectedTab(Object.keys(newTabs)[0])
    }
  }, [isLoading, errorMessage, archivesInfo])

  console.log('Rendering TTFFSummary')
  return (
    <>
      {Object.keys(tabs).length > 0 && (
        <div>
          <div className="tab-header">Source</div>
            <SegmentedButton 
              segments={Object.keys(tabs)}
              onChange={(value) => setSelectedTab(value)}
              active={selectedTab}
            />
          </div>
      )}
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
        <MetaKeySelection technology={technology} feature={feature} archives={archives} />
      </Row>
      {selectedTab && tabs[selectedTab].map(table => (
        <div key={selectedTab + table}>
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
                        table_name: table,
                        segment,
                        source: selectedTab,
                      }
                    }}
                    setFilters={setFilters}
                  />
                </Suspense>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col className="box report-plot">
              <h1 className="plot-title" style={{ marginTop: '25px' }}>CDF</h1>
              <Row className='justify-content-center zero-margin'>
                <Suspense fallback={<Spinner visible />}>
                  <CdfPlot
                    archives={archives}
                    technology={technology}
                    feature={feature}
                    filters={{
                      ...filters,
                      customFilters: {
                        table_name : table,
                        segment,
                        source: selectedTab,
                      }
                    }}
                    title={`${selectedTab}, ${segment}`}
                    />
                </Suspense>
              </Row>
            </Col>
          </Row>
        </div>
      ))}
      <NmeaSubPage
        technology={technology}
        feature={feature}
        archives={archives}
        filters={{
          ...filters,
          customFilters: {
            segment,
            source: selectedTab,
          }
        }}
        setFilters={setFilters}
        segment={segment}
      />
      <div className="spinner-gray"><Spinner visible={isLoading} /></div>
    </>
  )
}

TTFFSummary.propTypes = {
  archives: PropTypes.array.isRequired
}

export default React.memo(TTFFSummary)
