/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Text } from '@tidbits/react-tidbits'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { DataGrid, DataGridRow, DataGridColumn } from '@dx/continuum-data-grid'

import HelpTooltip from '../../Widgets/HelpTooltip'
import Box from '../../Box'
import { useFetchArchiveData } from '../../../hooks/fetchData'
import { ARCHIVE_REPORTING_LOGS, KPI_L3_SUMMARY_TABLE } from '../../../utilities/constants'
import { getIndices, isEmpty } from '../../../utilities/helpers'

const _ = require('underscore')

const technology = "ROUTINE"

const SingleHeadRowMultileTables = ({
  feature,
  archive,
  tab
}) => {
  const { tableName, columns } = KPI_L3_SUMMARY_TABLE[technology][feature]
  const [isLoading, archiveInfo] = useFetchArchiveData([archive.id], ARCHIVE_REPORTING_LOGS, tableName, columns)
  const [tablesInfo, setTablesInfo] = useState({})
  const { errorMessage } = archiveInfo

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const [archiveData] = Object.values(archiveInfo)
      if (!isEmpty(archiveData)) {
        const newTablesInfo = {}
        const [tableCol, categoryCol, valueCol, unitCol] = columns
        const distinctTables = _.uniq(archiveData[tableCol])
        distinctTables.forEach((table) => {
          const indices = getIndices(archiveData, _.range(archiveData[tableCol].length), tableCol, table)
          const seenCategories = new Set()
          const tableData = []
          let tableRow = {}
          indices.forEach((idx) => {
            const category = archiveData[categoryCol][idx]
            const unit = archiveData[unitCol][idx]
            const value = archiveData[valueCol][idx]
            const categoryLabel = unit ? `${category} (${unit})` : category
            if (seenCategories.has(categoryLabel)) {
              tableData.push(JSON.parse(JSON.stringify(tableRow)))
              tableRow = { [categoryLabel]: value }
              seenCategories.clear()
              seenCategories.add(categoryLabel)
            } else {
              tableRow[categoryLabel] = value
              seenCategories.add(categoryLabel)
            }
          })
          tableData.push(JSON.parse(JSON.stringify(tableRow)))
          newTablesInfo[table] = {
            data: tableData,
            headers: Array.from(seenCategories)
          }
        })
        setTablesInfo(newTablesInfo)
      }
    }
  }, [isLoading, archiveInfo])

  console.log('Rendering RoutineDeviceDetails')
  return (
    <>
      {Object.entries(tablesInfo).map(([table, { data, headers }]) => (
        <Box key={table} title={table}>
          <Col className="slv-tables">
            <DataGrid pageSize={15} data={data}>
              <DataGridRow>
                {headers.map(header => (
                  <DataGridRow key={header} field={header} />
                ))}
              </DataGridRow>
            </DataGrid>
          </Col>
        </Box>
      ))}
      <div className="spinner-gray"><Spinner visible={isLoading} /></div>
    </>
  )
}

export default React.memo(SingleHeadRowMultileTables)
