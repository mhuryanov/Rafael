/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useEffect, useState} from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { useFetchArchiveData } from '../../../../hooks/fetchData'
import { ARCHIVE_REPORTING_LOGS, PLOT_TABLE } from '../../../../utilities/constants'
import {
  isEmpty,
  filterArchiveData,
  getIndices,
} from '../../../../utilities/helpers'

const StackedBarTTFF = lazy(() => import('../../../Plots/StackedBarTTFF'))

const _ = require('underscore')

const technology = "R1"

const getKpiTable = (technology, feature) => {
  switch (true) {
    default:
      return (
        (technology in PLOT_TABLE && feature in PLOT_TABLE[technology])
          ? PLOT_TABLE[technology][feature]
          : {}
      )
  }
}

const getSeriesNames = (technology, feature) => {
  switch (true) {
    default:
      return (
        [
          "DidConnectToDevice",
          "ConfigureComplete",
          "Start",
          "FirstRssiMeasurement",
          "ProximityLevelFound",
          "EnteredArmsReach",
          "Stop",
          "Deinit",
        ]
      )
  }
}

const getPlotData = (archivesInfo, technology, feature) => {
  const { tableNameColumn, xColumn, serieColumn, valueColumn, descriptionColumn } = getKpiTable(technology, feature)
  const series = getSeriesNames(technology, feature)
  const allArchivesData = {}
  const tablesData = {}
  Object.keys(archivesInfo).forEach((archiveId, idx) => {
    const archiveData = archivesInfo[archiveId]
    const tables =_.unique(archiveData[tableNameColumn])
    const tableData = []
    tables.forEach((table) => {
      let [start, end] = filterArchiveData(
        archiveData, undefined, undefined, undefined, undefined, table, tableNameColumn
      )
      const allX = _.unique(archiveData[xColumn].slice(start, end))
      allX.forEach((x) => {
        let indices = end ? _.range(start, end) : _.range(archiveData[xColumn].length)
        const validIndices = getIndices(archiveData, indices, xColumn, x)
        const sessionData = {"iteration": x}
        validIndices.forEach((rowIdx) => {
          const serie =  archiveData[serieColumn][rowIdx]
          const value = archiveData[valueColumn][rowIdx]
          sessionData[serie] = value
        })
        // since stack view will stack values, need to calculate offset for all events
        // consider per technology and feature
        let previous = 0
        for (let key of series){
          if (key in sessionData)
          {
            const offset = sessionData[key] - previous
            previous = sessionData[key]
            sessionData[key] = offset
          }
        }
        tableData.push(sessionData)
      }) // for each session
      if (!isEmpty(tableData)) {
        tablesData[table] = tableData
      }
    }) // for all tables
    if (!isEmpty(tablesData)) {
      allArchivesData[archiveId] = tablesData
    }
  })  // for all archives
  return allArchivesData
}


const FindMyDeviceDetails = ({
  feature,
  archive,
  tab
}) => {

  const archiveIds = [archive.id]
  const { tableName, columns} = getKpiTable(technology, feature)
  const series = getSeriesNames(technology, feature)
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, tableName, columns)
  const { errorMessage } = archivesInfo
  const [mutliTableData, setMutliTableData] = useState({})

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const formattedData = getPlotData(archivesInfo, technology, feature)
      for (const [key, value] of Object.entries(formattedData)) {
        setMutliTableData(value)
      }
    }
  }, [isLoading, errorMessage, archivesInfo])

  return (
    <>
      {tab === 'Plots' && (
        Object.entries(mutliTableData).map(([table, data]) => (
          <Row key={table}>
            <Col className="box">
              <h1 className="plot-title" style={{ marginTop: '25px' }}>TTFF Stack View - {table}</h1>
              <Suspense fallback={<Spinner visible />}>
                <StackedBarTTFF feature={feature} dataToPlot={data} xKey={"iteration"} dataKeys={series} width={800} />
              </Suspense>
            </Col>
          </Row>
        ))
        
      )}
    </>
  )
}

export default React.memo(FindMyDeviceDetails)
