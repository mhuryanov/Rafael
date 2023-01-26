import React, { useEffect, useState } from 'react'
import { MenuList, Button } from '@tidbits/react-tidbits'
import Table from '@tidbits/react-tidbits/Table'
import { ARCHIVE_API, FIELDTEST_API, FIELDTEST_ARCHIVE_SHARED_API } from '../../utilities/constants'
import { sendToServer } from '../../utilities/helpers'
import { useFetchRafael } from '../../hooks/fetchData'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
const shortid = require('shortid')
const _ = require('underscore')
import { Toggle } from '@dx/continuum-toggle'
const ReProcessMenu = ({ itemId, itemType, onClose, handleClick }) => {
  const getProccessingJobUrl = (itemType === "Archive") ? `${ARCHIVE_API}${itemId}/proccessing_jobs` : `${FIELDTEST_API}${itemId}/proccessing_jobs`

  const [isLoading, AllJobsOrder] = useFetchRafael({ url: getProccessingJobUrl }, [])
  const [showArchiveTypeProccess, setShowArchiveTypeProccess] = useState(itemType === "Archive")
  const [reprocessOptions, setReprocessOptions] = useState('No Available Jobs.')
  const reProccessRequested = (job_id, archive_type) => {
    sendToServer(`${FIELDTEST_ARCHIVE_SHARED_API}${itemId}/reproccess/`, { job_id, archive_type }, 'POST', onClose)
  }
  const reProcessFinal = handleClick ? handleClick : reProccessRequested
  useEffect(() => {
    if (!isLoading) {
      let jobsOrder = AllJobsOrder
      if (!showArchiveTypeProccess) {
        jobsOrder = _.pick(AllJobsOrder, function (value, key, object) {
          return key === 'null';
        });
      }
      const maxLength = Math.max(..._.values(jobsOrder).map(jobs => jobs.length))
      if (maxLength != -Infinity) {
        const jobOrder = []
        const archive_types = []
        const header = <Table.TR borderTop="none" key={shortid.generate()} selected>
          {_.keys(jobsOrder).map(key => {
            jobOrder.push(jobsOrder[key])
            archive_types.push(key == 'null' ? null : key)
            return <Table.TH key={shortid.generate()}> {key == 'null' ? 'Field-Test Level' : key} </Table.TH>
          })}
        </Table.TR>
        const tableBody = []
        for (let index = 0; index < maxLength; index++) {
          const row = []
          for (let j = 0; j < jobOrder.length; j++) {
            const item = jobOrder[j][index]
            const cell = item === undefined ? null : <Table.TD key={shortid.generate()} hoverStyles>
              <Button primary variant="standard" mr={4} onClick={() => reProcessFinal(item.job_id, archive_types[j])}>{item.job__name} </Button>
            </Table.TD>
            row.push(cell)
          }
          tableBody.push(<Table.TR key={shortid.generate()}>{row}</Table.TR>)
        }
        setReprocessOptions(<>
          {(itemType != "Archive") && <h6 style={{ float: "right" }}>Show Archives Jobs:  <Toggle checked={showArchiveTypeProccess} onChange={() => setShowArchiveTypeProccess(!showArchiveTypeProccess)} /></h6>}
          <Table >
            <Table.THead borderTop="none"> {header} </Table.THead>
            <Table.TBody> {tableBody} </Table.TBody>
          </Table></>)
      }
    }
  }, [isLoading, AllJobsOrder, showArchiveTypeProccess])




  return (
    <MenuList>
      <Spinner visible={isLoading} />
      {reprocessOptions}
    </MenuList>
  )
}


export default React.memo(ReProcessMenu)