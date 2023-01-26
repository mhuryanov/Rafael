/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { StatePanel } from '@dx/continuum-state-panel'

import { useFetchArchiveData } from '../../../../hooks/fetchData'
import { isEmpty, setDefaultObject, createArchiveLabels } from '../../../../utilities/helpers'
import { SUMMARY_TABLE, ARCHIVE_REPORTING_LOGS } from '../../../../utilities/constants'

const DeviceCrashes = lazy(() => import('../DeviceCrashes'))
const SummaryTable = lazy(() => import('../../../Tables/SummaryTable'))
const GroupBarPlot = lazy(() => import('../../../Plots/GroupBarPlot'))

const _ = require('underscore')

const technology = "R1"


const FindMySummary = ({
  feature,
  archives,
}) => {
  const archiveIds = archives.map(archive => archive.id)
  const archiveLabels = React.useMemo(() => createArchiveLabels(archives), [archives])
  const { tableName, plotNameColumn, tableNameColumn, kpiColumn, itemsColumn, valueColumn } = SUMMARY_TABLE[technology][feature]
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, tableName)
  const [tablePlotMapping, setTablePlotMapping] = useState({})
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
      const newTablePlotMapping= {}
      Object.entries(archivesInfo).forEach(([archiveId, archiveData]) => {
        if (!isEmpty(archiveData)) {
          const tableNames = archiveData[tableNameColumn]
          const plotNames = archiveData[plotNameColumn]
          const kpis = archiveData[kpiColumn]
          const items = archiveData[itemsColumn]
          const values = archiveData[valueColumn]
          tableNames.forEach((tableName, i) => {
            setDefaultObject(newTablePlotMapping, tableName)
            const device = archiveLabels[archiveId].label
            const plotName = plotNames[i]
            const kpi = kpis[i]
            const item = items[i]
            const value = values[i]
            if (plotName) {
              setDefaultObject(newTablePlotMapping[tableName], device)
              setDefaultObject(newTablePlotMapping[tableName][device], plotName)
              setDefaultObject(newTablePlotMapping[tableName][device][plotName], kpi)
              newTablePlotMapping[tableName][device][plotName][kpi][item] = value
            }
          })
        }
      })
      setTablePlotMapping(newTablePlotMapping)
    }
  }, [isLoading, errorMessage, archivesInfo])

  const filterDevices = (devices) => {
    return Object.entries(devices)
      .filter(([device, plots]) => filters.archiveIds
      .map(archiveId => archiveLabels[archiveId].label).includes(device))
  }

  console.log('Rendering FindMySummary')
  return (
    <>
      {isEmpty(tablePlotMapping) && (
        <Col className="box">
          <StatePanel message="No data to show." suggestion="Data may still be processing." />
        </Col>
      )}
      {Object.entries(tablePlotMapping).map(([table, devices]) => (
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
                        table_name: table,
                      }
                    }}
                    setFilters={setFilters}
                  />
                </Suspense>
              </Row>
            </Col>
          </Row>
          {!isEmpty(devices) && filterDevices(devices).length > 0 && (
            <Row>
              <Col className="box report-plot">
                <h1 className="plot-title" style={{ marginTop: '25px' }}>{`Bar Plots: ${table}`}</h1>
                {filterDevices(devices)
                  .map(([device, plots]) => (
                  <Row key={device} className='bordered justify-content-center zero-margin' style={{ marginBottom: '15px' }}>
                    <div className="plot-title" style={{ textAlign: 'center' }}>{device}</div>
                    {Object.entries(plots).map(([plot, plotData]) => (
                      <Suspense key={plot} fallback={<Spinner visible />}>
                        <GroupBarPlot
                          data={plotData}
                          title={plot}
                        />
                      </Suspense>
                    ))}
                  </Row>
                ))}
              </Col>
            </Row>
          )}
        </div>
      ))}
      <div className="spinner-gray"><Spinner visible={isLoading && !errorMessage} /></div>
      <DeviceCrashes archives={archives} />
    </>
  )
}

FindMySummary.propTypes = {
  archives: PropTypes.array.isRequired
}

export default React.memo(FindMySummary)
