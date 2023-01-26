/* eslint-disable react/prop-types */
import React, { lazy, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Row, Col
} from 'react-bootstrap'
import { SegmentedButton } from '@dx/continuum-segmented-button'

import { addToObject, isEmpty } from '../../../../utilities/helpers'
import { ARCHIVE_REPORTING_LOGS, SUMMARY_TABLE } from '../../../../utilities/constants'
import { useFetchArchiveData } from '../../../../hooks/fetchData'
import Filter from '../../../Widgets/Filter'
import E911SessionSummary from './E911SessionSummary'
import Box from '../../../Box'
import HiddenBox from '../../../HiddenBox'

const SummaryTable = lazy(() => import('../../../Tables/SummaryTable'))
const AggregatedTable = lazy(() => import('../../../Tables/AggregatedTable'))
const Cdf = lazy(() => import('../../../Plots/Cdf'))
const E911MultiTimeSeries = lazy(() => import('../../../Plots/E911MultiTimeSeries'))
const NmeaSubPage = lazy(() => import('../NMEASubPage'))

const _ = require('underscore')
const technology = "E911"


const E911Summary = ({
  feature,
  archives,
}) => {
  const archiveIds = archives.map(archive => archive.id)
  const completedDevices = _.uniq(archives.map(archive => archive.model_hardware))
  const completedBuildTrains = _.uniq(archives.map(archive => archive.build_train))
  const [filters, setFilters] = useState({
    archiveIds,
    devices: completedDevices,
    buildTrains: completedBuildTrains,
  })
  const { tableName, sourceColumn, tableNameColumn } = SUMMARY_TABLE[technology].ZAXIS
  const [archiveGroups, setArchiveGroups] = useState({})
  const [selectedTest, setSelectedTest] = useState('')
  const [selectedSource, setSelectedSource] = useState('')
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, tableName)
  const [sourceTableMapping, setSourceTableMapping] = useState({})
  const { errorMessage } = archivesInfo

  useEffect(() => {
    const newArchiveGroups = {}
    archives.forEach(archive => {
      const { fieldtest_name } = archive
      const [testCase] = fieldtest_name.split('-')
      addToObject(newArchiveGroups, testCase, [archive])
    })
    setArchiveGroups(newArchiveGroups)
    setSelectedTest(Object.keys(newArchiveGroups)[0] || '')
  }, [archives])

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const newSourceTableMapping = {}
      Object.entries(archivesInfo).forEach(([archiveId, archiveData]) => {
        if (!isEmpty(archiveData)) {
          const sources = archiveData[sourceColumn]
          const tableNames = archiveData[tableNameColumn]
          sources.forEach((source, i) => {
            if (!(source in newSourceTableMapping) || !(newSourceTableMapping[source].includes(tableNames[i]))) {
              addToObject(newSourceTableMapping, source, [tableNames[i]])
            }
          })
        }
      })
      setSourceTableMapping(newSourceTableMapping)
    }

  }, [isLoading, archivesInfo])

  const handleSourceSelect = (tab) => {
    setSelectedSource(tab)
    setFilters(prevFilters => ({
      ...prevFilters,
      tables: sourceTableMapping[tab]
    }))
  }

  const handleTestSelect = (tab) => {
    setSelectedTest(tab)
  }

  console.log('Rendering E911Summary')
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
      <E911SessionSummary archives={archives} feature={feature} filters={filters} />
      <HiddenBox title="Summary Report" type="report-table no-min" isLoading={isLoading}>
        <AggregatedTable
          feature={feature}
          archiveGroups={archiveGroups}
          technology={technology}
          filters={filters}
        />
      </HiddenBox>
      <NmeaSubPage
          technology={technology}
          feature={feature}
          archives={archives}
          filters={{
            ...filters,
            customFilters: { segment: "ENTIRE_CALL" }
          }}
          setFilters={setFilters}
          segment={"ENTIRE_CALL"}
      />
      <Col style={{ marginTop: '50px' }}>
        <div className="tab-header">Test Case</div>
        <SegmentedButton 
          segments={Object.keys(archiveGroups)}
          onChange={handleTestSelect}
          active={selectedTest}
        />
      </Col>
      <Col style={{ marginTop: '25px' }}>
        <div className="tab-header">Technology</div>
        <SegmentedButton 
          segments={Object.keys(sourceTableMapping)}
          onChange={handleSourceSelect}
          active={selectedSource}
        />
      </Col>
      {(selectedTest && selectedSource in sourceTableMapping) && (
        <div key={selectedTest + selectedSource}>
          <Row>
            <Col className="fieldtest-filter">
              <Filter
                title="Filter by Table"
                type="tables"
                items={sourceTableMapping[selectedSource]}
                filters={filters}
                setFilters={setFilters}
              />
            </Col>
          </Row>
          {sourceTableMapping[selectedSource]
            .filter(table => filters.tables.includes(table)).map(table => (
            <div key={table}>
              <Box title={table} subTitle={`Test Case: ${selectedTest}`} type="report-table">
                <SummaryTable
                  feature={feature}
                  archives={archiveGroups[selectedTest]}
                  technology={technology}
                  filters={{
                    ...filters,
                    customFilters: { table_name: table, source: selectedSource}
                  }}
                  setFilters={setFilters}
                />
              </Box>
              <HiddenBox title="CDF" type="report-plot no-min">
                <Cdf
                  feature={feature}
                  archives={archiveGroups[selectedTest]}
                  technology={technology}
                  filters={{
                    ...filters,
                    customFilters: { table_name: table, source: selectedSource }
                  }}
                  title={`${selectedSource}, ${table}`}
                />
              </HiddenBox>
            </div>
          ))}
          <HiddenBox title="Time Series" type="time-series-plot">
            <E911MultiTimeSeries
              archives={archives}
              technology={technology}
              filters={{
                ...filters,
                customFilters: { source: selectedSource, allTables: sourceTableMapping[selectedSource] }
              }}
              title={`${selectedSource}`}
            />
          </HiddenBox>
        </div>
      )}
    </>
  )
}

E911Summary.propTypes = {
  archives: PropTypes.array.isRequired
}

export default React.memo(E911Summary)
