import React, { useState, useEffect, lazy } from 'react'
import styled from 'styled-components'
import { useTable } from 'react-table'
import { labelCase, sendToServer, isUserAdmin } from '../../../../../utilities/helpers'
import { useFetchRafael } from '../../../../../hooks/fetchData'
import { getTaskStatusCount } from '../../helpers'
import Constants from '../../../../../utilities/constants'
import { Toggle } from '@dx/continuum-toggle'
import { Row, Col } from 'react-bootstrap'
import HistoryTimeline from './pipeline_proccessing_timeline'
const Select = lazy(() => import('react-select/creatable'))
const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`

const RowFormater = (row) => {
  const { updated_at, pipelinestate, requester } = row
  return {
    updated_at, requester, job: pipelinestate.split("__")[0], pipelinestate: getTaskStatusCount(pipelinestate)
  }

}
function Table({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  })

  // Render the UI for your table
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const PipelineHistory = ({ info, itemType }) => {
  const [isLoadingJobs, jobs] = useFetchRafael({ url: `${Constants.JOBS_API}?backend_task=false` }, [])
  const columns = React.useMemo(
    () =>
      ["updated_at", 'job', "pipelinestate", "requester"].map((item) => {
        return {
          Header: labelCase(item),
          accessor: item
        };
      }),
    []
  );
  const [autoUpdate, setAutoUpdate] = useState(false)
  const [firstHistory, setFirstHistory] = useState(undefined)
  const [history, setHistory] = useState([])
  const [itemInfo, setItemInfo] = useState(undefined)
  const updateHistory = () => {
    sendToServer(`${Constants.FIELDTEST_ARCHIVE_SHARED_API + info.id}/history`, {}, 'GET', (rawHistory) => {
      setHistory(rawHistory.map(RowFormater))
      setFirstHistory(rawHistory[0])
    })
  }
  const updateArchiveInfo = () => {
    sendToServer(`${Constants.ARCHIVE_API + info.id}`, {}, 'GET', setItemInfo)
  }
  useEffect(() => {
    updateHistory()
    updateArchiveInfo()
  }, [])
  const investigationChanged = () => {
    sendToServer(`${Constants.ARCHIVE_API + info.id}/investigate`, {}, 'GET', () => {
      updateHistory()
      updateArchiveInfo()
    })
  }

  const triggerHandler = (selectedJob) => {
    console.log(selectedJob.value)
    sendToServer(`${Constants.FIELDTEST_ARCHIVE_SHARED_API + info.id}/reproccess/`, { job_id: selectedJob.value, archive_type: itemInfo.archivetype }, 'POST', () => {
      updateHistory()
    })
  }
  const investigate = (!isUserAdmin && itemType != "Archive" || !itemInfo) ? null :
    <Row>
      <Col>
        {itemInfo.archivetype.startsWith("#") && <h6>Job Name:
          {!isLoadingJobs && <Select
            placeholder="Select a Job name to trigger."
            onChange={triggerHandler}
            options={Object.keys(jobs).map(log => ({ label: jobs[log].name, value: jobs[log].id })).sort((a, b) => a.label > b.label)}
          />}
        </h6>}
        <h6 style={{ float: "right" }}>Investigate:  <Toggle checked={itemInfo.archivetype.startsWith("#")} onChange={investigationChanged} /></h6>
      </Col>
    </Row >

  let intervalID;
  useEffect(() => {
    if (autoUpdate) {
      intervalID = setInterval(() => {
        updateHistory()
      }, 10 * 1000);
    }
    return () => clearInterval(intervalID);
  }, [autoUpdate]);
  return (
    <>
      {firstHistory !== undefined && <HistoryTimeline info={info} itemType={itemType} lastHistory={firstHistory} />}
      {investigate}
      <Styles>
        <Table columns={columns} data={history} />
      </Styles>
      <Row>
        <Col>
          <h8>
            {`Updated: ${Date().toLocaleString()}`}

          </h8>
          <h8 style={{ float: "right" }}>Auto Update:  <Toggle checked={autoUpdate} onChange={() => setAutoUpdate(!autoUpdate)} /></h8>
        </Col>
      </Row>
    </>
  )
}

export default PipelineHistory