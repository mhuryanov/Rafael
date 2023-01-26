/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useState } from 'react'
import Table from '@tidbits/react-tidbits/Table'
import { StatePanel } from '@dx/continuum-state-panel'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { Link } from 'react-router-dom'

import { useFetchArchiveData } from '../../hooks/fetchData'
import { isEmpty, isValidArchiveData, createArchiveLabels, setDefaultObject, addToObject } from '../../utilities/helpers'
import { getColorStyle } from './SummaryTable/helpers'
import { SUMMARY_TABLE, ARCHIVE_REPORTING_LOGS } from '../../utilities/constants'

const shortid = require('shortid')
const _ = require('underscore')

const FAIL = 2
const PASS_WITH_ISSUES = 3

const rowStyle = { fontSize: '12px' }
const colStyle = { fontWeight: 'normal', fontStyle: 'italic' }

const ErrorMessage = () => (
  <StatePanel
    message="Error- could not find KPI summary data."
    suggestion="Data may still be processing."
  />
)

const processValues = (values) => {
  let result
  let color
  switch (true) {
    case values.includes(FAIL):
      result = 'Fail'
      color = 'red'
      break
    case values.includes(PASS_WITH_ISSUES):
      result = 'Pass'
      color = 'gold'
      break
    case values.length > 0:
      result = 'Pass'
      color = 'green'
      break
    default:
      result = 'N/A'
      color = ''
      break
  }
  return [result, color]
}

const getE911Row = (archiveTestData, testCases) => {
  const archiveRow = []
  const { valueColumn } = SUMMARY_TABLE.E911.SCANNER
  testCases.forEach((testCase) => {
    const archiveData = archiveTestData[testCase]
    if (!isEmpty(archiveData)) {
      const values = archiveData[valueColumn]
      const [result, color] = processValues(values)
      archiveRow.push({
        value: result,
        color
      })
    } else {
      archiveRow.push({
        value: 'N/A'
      })
    }
  })
  return archiveRow
}

const getTableBody = (archiveGroups, archivesInfo, archiveLabels, technology, feature, filters) => {
  const tableBody = []
  const archivesTestData = {}
  _.each(archiveGroups, (archives, testCase) => {
    archives.forEach((archive) => {
      const { id: archiveId } = archive
      const archiveData = archivesInfo[archiveId]
      const isValid = isValidArchiveData(archiveData, archiveId, archiveLabels, filters, ['archives'])
      if (isValid) {
        setDefaultObject(archivesTestData, archiveId)
        addToObject(archivesTestData[archiveId], testCase, archiveData)
      }
    })
  })
  Object.entries(archivesTestData).forEach(([archiveId, archiveTestData]) => {
    if (!isEmpty(archivesTestData)) {
      tableBody.push(
        <AggregatedRow
          key={shortid.generate()}
          testCases={Object.keys(archiveGroups)}
          archiveId={archiveId}
          archiveLabel={archiveLabels[archiveId]}
          archiveTestData={archiveTestData}
          technology={technology}
          feature={feature}
        />
      )
    }
  })
  return tableBody
}


const AggregatedRow = ({ technology, feature, archiveId, archiveLabel, testCases, archiveTestData }) => {
  const archiveRow = []
  switch (technology) {
    default:
      archiveRow.push(...getE911Row(archiveTestData, testCases))
      break
  }
  return (
    <Table.TR>
      <Table.TD className="border-left border-right" style={colStyle}>
        <span className="color-block" style={{ backgroundColor: archiveLabel.color }} />
        <span className="table-entry">
          <Link to={`/technology/${technology}/${feature}/device/${archiveId}`}>{archiveLabel.label}</Link>
        </span>
      </Table.TD>
      {_.map(archiveRow, col => (
        <Table.TD style={colStyle} key={shortid.generate()}>
          <span className="table-entry" style={getColorStyle(col.color)}>
            {col.value}
          </span>
        </Table.TD>
      ))}
    </Table.TR>
  )
}

const AggregatedTable = ({
  archiveGroups,
  technology,
  feature,
  filters,
  visible
}) => {
  const archives = Object.values(archiveGroups).flat()
  const archiveIds = archives.map(archive => archive.id)
  const { tableName } = SUMMARY_TABLE[technology].SCANNER
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, tableName)
  const [tableState, setTableState] = useState({
    header: null,
    body: [],
    isProcessing: true
  })
  const { errorMessage } = archivesInfo
  const { header, body, isProcessing } = tableState

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const archiveLabels = createArchiveLabels(archives)
      const newBody = getTableBody(archiveGroups, archivesInfo, archiveLabels, technology, feature, filters)
      const newHeader = (
        <Table.THead style={{ backgroundColor: '#8d93ea', fontSize: '14px' }}>
          <Table.TR>
            {_.map(['Devices'].concat(Object.keys(archiveGroups)), col => (
              <Table.TH
                key={shortid.generate()}
              >
                {col}
              </Table.TH>
            ))}
          </Table.TR>
        </Table.THead>
      )
      setTableState({
        header: newHeader,
        body: newBody,
        isProcessing: false
      })
    }
  }, [isLoading, archivesInfo, errorMessage, filters])


  console.log('Rendering AggregatedTable')
  return (
    visible && (
      <>
        {(errorMessage || (body.length === 0 && !isProcessing))
          ? <ErrorMessage /> : (
            <div style={{ overflowX: 'scroll ', paddingBottom: '35px' }}>
              <Table>
                {header}
                <tbody style={rowStyle}>
                  {body}
                </tbody>
              </Table>
            </div>
          )}
        <Spinner visible={isLoading} />
      </>
    )
  )
}

export default React.memo(AggregatedTable)
