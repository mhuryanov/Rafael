import React, { useState, Suspense, lazy, useEffect } from 'react'
import { DataGrid, DataGridRow, DataGridColumn } from '@dx/continuum-data-grid'
import { Button } from '@dx/continuum-button'
import { showMenu } from 'react-contextmenu/modules/actions'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { SCHEDULER_API } from '../../../utilities/constants'
import { getTaskStatusCount } from './helpers'
import { isEmpty, downloadStorage } from '../../../utilities/helpers'
import { sendToServer } from '../../../utilities/helpers'
import { AiTwotoneExperiment } from 'react-icons/ai/index'
import { ImFileZip } from 'react-icons/im/index'
import { Toggle } from '@dx/continuum-toggle'
const ItemPopup = lazy(() => import('../../Pages/StatusPage/DirectoryBody/Popup'))
const ReProcessMenu = lazy(() => import('../../Widgets/ReProcess'))

import Box from '../../Box'
import shortid from 'shortid'

const COLUMNS = [
  'Updated At',
  'Task',
  'Run Count',
  'Logs',
  'Task Status',
  'Check Status At',
  'Item',
  'Technology',
  'Feature',
  'Job Name',
  'Job Created By'
]

const PROD_URL = 'keylimepie.apple.com'
const BASE_SPARK_URL = 'https://compute.pie.apple.com/workspaces/keylime/environments'
const BASE_SIMCLOUD_URL = 'https://batch.apple.com/ui/jobs/manage?cluster=mr2&owner=keylime_pie_bot'
const BASE_SPLUNK_URL = 'https://splunk.pie.apple.com/en-US/app/search/search?q=search%20index%3Dorchard%20source%3D*'
const LOG_WINDOW_IN_SECONDS = 1800 // 30 minutes from start time

const getTaskUrl = (taskId, taskType, job_config) => {
  const env = window.location.href.includes(PROD_URL) ? 'prod' : 'staging'
  switch (taskType.toUpperCase()) {
    case 'SPARK':
      return `${BASE_SPARK_URL}/keylime-${env}/jobs/${job_config.spark_job_name}.${job_config.spark_repo_name}.keylime-${env}/runs/${taskId}`
    case 'SIMCLOUD':
      return `${BASE_SIMCLOUD_URL}&jobId=${taskId}`
    default:
      return ''
  }
}

const getLogsUrl = (taskId, job_config) => {
  const [startTimeInMs] = taskId.split('-')
  const startTimeInSeconds = Math.floor(startTimeInMs / 1000)
  const jobKey = `spark_${job_config.spark_repo_name}-${job_config.spark_job_name}`
  return `${BASE_SPLUNK_URL}${jobKey}-${taskId}*stdout%20OR%20serviceId%3D${jobKey}-${taskId}*stdout&earliest=${startTimeInSeconds}&latest=${startTimeInSeconds + LOG_WINDOW_IN_SECONDS}`
}



const SimCloudLogDownload = ({ jobName, archive_id }) => {
  const [redirect, setRedirect] = useState(null)
  const handleClick = () => downloadStorage(archive_id, jobName)



  return (
    <>
      <Button onClick={handleClick}>Download</Button>
      {redirect}
    </>
  )
}


const TasksList = () => {
  const [tasks, setTasks] = useState([])
  const [autoUpdate, setAutoUpdate] = useState(false)
  useEffect(() => {
    updateTasks()
  }, [])
  const updateTasks = () => {
    sendToServer(`${SCHEDULER_API}tasks_list`, {}, 'GET', (data) => { setTasks(data); console.log("Tasks List Updated") })
  }

  const [itemInfoPopup, setItemInfoPopup] = useState({ 'Details': false, 'ReProccess': false, "show": true })

  const onProccessedItemClick = (eventKey, itemId, itemType, popupType) => {
    showMenu({
      position: {
        x: eventKey.pageX,
        y: eventKey.pageY - document.documentElement.scrollTop
      },
      target: {},
      id: shortid.generate()
    });
    const popupInfo = { itemType, itemId, "show": true }
    popupInfo[popupType] = true

    setItemInfoPopup(popupInfo)
  }

  const tasksList = (
    !isEmpty(tasks) ? tasks.map((task) => {
      const taskUrl = getTaskUrl(task.scheduled_id, task.executor, task.job_config)
      const logsUrl = task.executor === 'Spark' ? getLogsUrl(task.scheduled_id, task.job_config) : ''
      const itemType = task.archive_id ? "Archive" : 'Fieldtest'
      const itemId = task.archive_id ? task.archive_id : task.fieldtest_id
      const itemIcon = task.archive_id ? <AiTwotoneExperiment /> : <ImFileZip />
      const itemDetails = <Button onClick={(eventKey) => { onProccessedItemClick(eventKey, itemId, itemType, 'Details') }}>{itemIcon}</Button>
      return ({
        'Updated At': task.updated_at.split('T').join(' '),
        'Task': <a href={taskUrl} target="_blank" rel="noreferrer noopener">{task.executor}</a>,
        'Run Count': task.run_count,
        'Logs': task.executor === 'Simcloud' ? <SimCloudLogDownload jobName={task.job_name} archive_id={task.archive_id} /> : <a href={logsUrl} target="_blank" rel="noreferrer noopener">Splunk</a>,
        'Task Status': getTaskStatusCount(task.status),
        'Tries': task.re_try_count,
        'Check Status At': task.check_status_at && task.check_status_at.split('T').join(' '),
        "_Item": <>{itemDetails}</>,
        get "Item"() {
          return this["_Item"]
        },
        set "Item"(value) {
          this["_Item"] = value
        },
        'Technology': task.technology ? task.technology : task.fieldtest_technology,
        'Feature': task.feature ? task.feature : task.fieldtest_feature,
        'Job Name': task.job_name,
        'Job Created By': task.job_created_by,
        'Search': `${task.scheduled_id} ${task.executor} ${itemId} ${task.job_name} ${task.technology} ${task.job_created_by} ${task.status} ${itemType}`
      })
    }).sort((a, b) => a['Updated At'] < b['Updated At'])
      : []
  )
  // Use a better table with better search and filter and format #TODO
  console.log(itemInfoPopup)
  let intervalID;
  useEffect(() => {
    if (autoUpdate) {
      intervalID = setInterval(() => {
        updateTasks()
      }, 10 * 1000);
    }
    return () => clearInterval(intervalID);
  }, [autoUpdate]);


  return (!isEmpty(tasks) && <Box title="Tasks " className="mr-auto" style={{ overflowX: "auto" }}>
    <><h8 style={{ float: "right" }}>Auto Update:  <Toggle checked={autoUpdate} onChange={() => setAutoUpdate(!autoUpdate)} /></h8></>
    <DataGrid
      pageSize={100}
      data={tasksList}
      variant="striped"
    >
      <DataGridRow>
        {COLUMNS.map((column) => (
          <DataGridColumn key={column} field={column} />
        ))}
      </DataGridRow>
    </DataGrid>
    <Suspense fallback={<Spinner animation="grow" variant="info" />}>
      {itemInfoPopup.Details && <ItemPopup {...itemInfoPopup} onClose={() => { setItemInfoPopup({ 'Details': false, 'ReProccess': false }) }} />}
      {itemInfoPopup.ReProccess && <ReProcessMenu
        {...itemInfoPopup}
        handleClick={() => { setReProccessPopup({ 'Details': false, 'ReProccess': false }) }}
      />}
    </Suspense>

  </Box >
  )
}

export default React.memo(TasksList)