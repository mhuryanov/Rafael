/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useState } from 'react'
import { StatePanel } from '@dx/continuum-state-panel'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import Table from '@tidbits/react-tidbits/Table'
import { Text, Link } from '@tidbits/react-tidbits'
import { Icons } from '@tidbits/react-tidbits'
import pako from 'pako'

import { E911VerdictIcons } from '../../components/Pages/TechnologyPage/E911/E911DeviceDetails'
import { useFetchArchiveData } from '../../hooks/fetchData'
import { createArchiveLabels, isValidArchiveData, isEmpty } from '../../utilities/helpers'
import { SUMMARY_TABLE, ARCHIVE_REPORTING_LOGS,} from '../../utilities/constants'
import IconPopover from '../Widgets/IconPopover'

const shortid = require('shortid')
const _ = require('underscore')

const handleCopy = (id) => {
  const temp = document.createElement('textarea')
  temp.value = document.getElementById(id).innerText
  document.body.appendChild(temp)
  temp.select()
  document.execCommand('copy')
  document.body.removeChild(temp)
}

const getKpis = (archivesInfo, summaryInfo) => {
  const { kpiColumn } = summaryInfo
  let kpis = []
  Object.values(archivesInfo).forEach((archiveData) => {
    const archiveKpis = archiveData[kpiColumn]
    kpis = _.uniq(kpis.concat(archiveKpis)).filter(kpi => kpi)
  })
  return kpis
}

const getColumnNames = (kpis) => {
  const colNames = []
  colNames.push(...['Devices', 'Call Session'])
  kpis.forEach((kpi) => {
    colNames.push(kpi)
  })
  return colNames
}

const colStyle = { fontWeight: 'normal', fontStyle: 'italic' }

const ErrorMessage = () => (
  <StatePanel
    message="Error- could not find KPI summary data."
    suggestion="Data may still be processing."
  />
)

const getE911ArchiveRow = (archiveData, summaryInfo, callSession, kpis, handleCallClick) => {
  const { callColumn, scannerColumn, kpiColumn, valueColumn } = summaryInfo
  const archiveRow = []
  const callSessionValue = callSession.split(' ')[1].slice(1, -1)
  
  archiveRow.push({ 
    value: <Link id={`${callSessionValue}`} onClick={() => handleCallClick(callSessionValue)}>{callSessionValue}</Link> 
  })
  const callSessions = archiveData[callColumn]
  const callStart = callSessions.indexOf(callSession)
  const callEnd = callSessions.lastIndexOf(callSession) + 1
  const values = archiveData[valueColumn].slice(callStart, callEnd)
  const fetchedKpis = archiveData[kpiColumn].slice(callStart, callEnd)
  const scannerDetails = archiveData[scannerColumn].slice(callStart, callEnd)
  fetchedKpis.forEach((kpi) => {
    if (kpis.includes(kpi)) {
      const kpiIdx = fetchedKpis.indexOf(kpi)
      const value = values[kpiIdx] || null
      const scannerDetail = scannerDetails[kpiIdx]
      let decodedScannerDetail
      try {
        decodedScannerDetail = pako.inflate(atob(scannerDetail), { to: 'string' })
      } catch (e) {
        decodedScannerDetail = scannerDetail || 'No logs found.'
      }
      const id = shortid.generate()
      archiveRow.push({
        value: (
          <IconPopover
            title={`Scanner Detail: ${kpi} (${callSessionValue})`}
            content={(
              <>
                <Icons.DuplicateIcon
                  width="20px"
                  height="20px"
                  color="info"
                  cursor="pointer"
                  mr="5px"
                  mb="3px"
                  onClick={() => handleCopy(id)}
                />
                <div
                  id={id}
                  className="scanner-detail"
                  dangerouslySetInnerHTML={{ __html: decodedScannerDetail }}
                />
              </>
            )}
            icon={E911VerdictIcons[value]}
            customClass="scanner-popover"
          />
        )
      })
    }
  })
  return archiveRow
}


const getHeader = (kpis) => {
  const colNames = getColumnNames(kpis)
  return (
    <Table.THead>
      <Table.TR>
        {_.map(colNames, (col, idx) => (
          <Table.TH
            key={shortid.generate()}
            colSpan={1}
          >
            {col}
          </Table.TH>
        ))}
      </Table.TR>
    </Table.THead>
  )
}

const getTableBody = (
  archivesInfo, archiveLabels, technology, feature, kpis, handleCallClick
) => {
  if (kpis.length === 0) return []
  const tableBody = []
  Object.keys(archivesInfo).forEach((archiveId) => {
    const archiveData = archivesInfo[archiveId]
    if (!isEmpty(archiveData)) {
      tableBody.push(
        <ScannerRow
          key={shortid.generate()}
          archiveId={archiveId}
          archiveData={archiveData}
          archiveLabel={archiveLabels[archiveId]}
          technology={technology}
          feature={feature}
          kpis={kpis}
          handleCallClick={handleCallClick}
        />
      )
    }
  })
  return tableBody
}


const ScannerRow = ({ technology, feature, archiveId, archiveData, archiveLabel, kpis, handleCallClick}) => {
  const archiveRows = []
  const summaryInfo = SUMMARY_TABLE[technology].SCANNER
  const { callColumn } = summaryInfo
  const callSessions = _.uniq(archiveData[callColumn]).sort()
  callSessions.forEach((callSession, i) => {
    const archiveRow = []
    if (i === 0) {
      archiveRow.push({
        value: <Link to={`/technology/${technology}/${feature}/device/${archiveId}`}>{archiveLabel.label}</Link>
      })
    } else {
      archiveRow.push({
        value: ''
      })
    }
    archiveRow.push(...getE911ArchiveRow(archiveData, summaryInfo, callSession, kpis, handleCallClick))
    archiveRows.push(archiveRow)
  })

  return (
    archiveRows.map((archiveRow, rowIdx) => (
      <Table.TR key={shortid.generate()}>
        {_.map(archiveRow, (col, colIdx) => (
          <Table.TD style={{...colStyle, backgroundColor: col.color }} key={shortid.generate()}>
            {rowIdx === 0 && colIdx === 0 && <span className="color-block" style={{ backgroundColor: archiveLabel.color }} />}
            {col.value}
          </Table.TD>
        ))}
      </Table.TR>
    ))
  )
}

const ScannerTable = ({ archives, technology, feature, handleCallClick }) => {
  const archiveIds = archives.map(archive => archive.id)
  const summaryInfo = SUMMARY_TABLE[technology].SCANNER
  const { tableName } = summaryInfo
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, tableName)
  const [tableState, setTableState] = useState({
    body: [],
    header: null,
    isProcessing: true
  })
  const { errorMessage } = archivesInfo
  const { body, header, isProcessing } = tableState

  console.log(archivesInfo)

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const archiveLabels = createArchiveLabels(archives)
      const kpis = getKpis(archivesInfo, summaryInfo)
      const newTableBody = getTableBody(archivesInfo, archiveLabels, technology, feature, kpis, handleCallClick)
      const newHeader = getHeader(kpis)
      setTableState({
        body: newTableBody,
        header: newHeader,
        isProcessing: false
      })
    }
  }, [isLoading, archivesInfo, errorMessage])

  console.log('Rendering ScannerTable')
  return (
    <>
      {((body.length === 0 && !isProcessing))
        ? <ErrorMessage />
        : (
          <div style={{ overflowX: 'scroll' }}>
            <Table bordered responsive>
              {header}
              <Table.TBody>
                {body}
              </Table.TBody>
            </Table>
          </div>
        )}
      <Spinner visible={isLoading} />
    </>
  )
}

export default React.memo(ScannerTable)
