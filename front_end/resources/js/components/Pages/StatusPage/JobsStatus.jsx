import React, { useEffect, useState } from 'react'
import Table from 'rc-table'
import { Button } from '@dx/continuum-button'
import { JOBS_API } from '../../../utilities/constants'
import { isEmpty, labelCase, sendToServer } from '../../../utilities/helpers'

const columns = [
  'id',
  'name',
  'keep_tasks',
  'backend_task',
  'stable',
  'last_results',
  'error'
].map(key => ({
  title: labelCase(key),
  dataIndex: key,
  key,
  width: 300,
  render: item => (
    <h4>{JSON.stringify(item)}</h4>)
}))
const runJob = (jobId) => {
  sendToServer(`/api/v0.01/scheduler_manager/run_job/${jobId}`)
}
const stableJob = (jobId) => {
  sendToServer(`/api/v0.01/jobs/${jobId}/re_try_stable/`)
}
columns.push({
  title: 'Actions',
  dataIndex: '',
  key: 'operations',
  render: a => (
    <>
      <Button onClick={() => runJob(a.id)}>Run</Button>
      <Button onClick={() => stableJob(a.id)}>Stable</Button>
    </>

  )
})


export const JobStatus = () => {
  // const [isLoading, jobs] = useFetchRafael({ url: JOBS_API }, [])

  const [jobs, setJobs] = useState([])
  useEffect(() => {
    sendToServer(JOBS_API, {}, 'GET', setJobs)
    // const interval = setInterval(() => {
    //   sendToServer(JOBS_API, {}, 'GET', setJobs)
    // }, 1000) // 1 sec
    // return () => clearInterval(interval)
  }, [])

  return !isEmpty(jobs) && (
    <>
      <Table columns={columns} data={jobs} />
      <h6>
        {`Updated: ${Date().toLocaleString()}`}
      </h6>
      <Button onClick={() => { sendToServer(JOBS_API, {}, 'GET', setJobs) }}>Refresh</Button>
    </>

  )
}

export default JobStatus
