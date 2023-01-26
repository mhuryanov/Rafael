import React, { useEffect, useState } from 'react'
import { Row, Col, Dropdown, DropdownButton } from 'react-bootstrap'
import useDeepCompareEffect from 'use-deep-compare-effect'

import { useFetchRafael } from '../../../../hooks/fetchData'
import { sendToServer, isEmpty, AddNotification } from '../../../../utilities/helpers'
import { JOBS_API } from '../../../../utilities/constants'
import { Toggle } from '@dx/continuum-toggle'
import CreatableSelect from 'react-select/creatable'
import DatePicker from 'react-datepicker'
import Form from "@rjsf/material-ui";
import 'react-datepicker/dist/react-datepicker.css'
const JobSettingsForm = ({ technology, editAccess }) => {
  const [isLoadingJobs, jobs] = useFetchRafael({ url: (technology) ? `${JOBS_API}?technology=${technology}` : JOBS_API }, [])
  const [isSchemaLoading, allSchemas] = useFetchRafael({ url: JOBS_API + "jobs_schema/" }, [])
  const [schema, setSchema] = useState(null)
  const [canEdit, setCanEdit] = useState(false)
  const [selectedJob, setSelectedJob] = useState({})

  const get_new_job = (name) => {
    return {
      "cron": "* * * * *",
      "executor": "Simcloud",
      "name": name,
      "job_config": {},
      "next_run_at": new Date()
    }
  }

  const handleJobSelect = (option) => {
    const { value: selectedJob, label } = JSON.parse(JSON.stringify(option))
    if (selectedJob instanceof Object) {
      selectedJob.next_run_at = new Date(selectedJob.next_run_at)
      console.log(selectedJob.job_config)
      setSelectedJob(selectedJob)
    } else {
      setSelectedJob(get_new_job(label))
      setCanEdit(true && editAccess)
    }

  }
  useDeepCompareEffect(() => {
    setSchema(allSchemas[selectedJob.executor])
  }, [selectedJob])

  const updateNextRunAt = (date) => {
    selectedJob.next_run_at = date
    setSelectedJob({ ...selectedJob })
  }
  const updateExecutor = (executor) => {
    setSchema(allSchemas[executor])
    selectedJob.executor = executor
    selectedJob.job_config = {}
    setSelectedJob({ ...selectedJob })
  }
  const updateConfig = ({ formData }) => {
    console.log("New")
    console.log(formData)
    setSelectedJob(Object.assign(selectedJob, { "job_config": formData }))
  }

  const updateSucceeded = () => {
    AddNotification(`Job ${selectedJob.name}  is updated successfully`, "success")
  }
  const createSucceeded = ({ id }) => {
    selectedJob.id = id
    setSelectedJob({ ...selectedJob })
    AddNotification(`Job ${selectedJob.name}  is created successfully`, "success")
  }
  const submitFailed = (msg) => {
    AddNotification(msg, 'danger')
  }
  const submitJobUpdate = () => {
    if (canEdit) {
      if (selectedJob.id) {
        sendToServer(`${JOBS_API}${selectedJob.id}`, selectedJob, 'PATCH', updateSucceeded, submitFailed)
      } else {
        sendToServer(`${JOBS_API}`, selectedJob, 'POST', createSucceeded, submitFailed)
      }
    } else {
      AddNotification(editAccess ? "To edit this job, enable edit first" : "You cant edit this job", 'danger')
    }
  }
  return !isSchemaLoading && !isLoadingJobs &&
    <>
      <Row className='justify-content-center'>
        <Col lg={5} md={5} sm={5}>
          <h6>Job Name:
            <CreatableSelect
              value={!isEmpty(selectedJob) && { label: selectedJob.name, value: selectedJob }}
              placeholder={`Select a log name..., Or type a New Name`}
              onChange={handleJobSelect}
              options={Object.keys(jobs).map(log => ({ label: jobs[log].name, value: jobs[log] })).sort((a, b) => a.label > b.label)}
            />
          </h6>
        </Col>
        <Col lg={3} md={3} sm={3}>
          {!isEmpty(selectedJob) &&
            <h6>Executor Type:
              <DropdownButton id="dropdown-basic-button" title={selectedJob.executor} style={{ width: "auto" }} disabled={!canEdit}>
                {Object.keys(allSchemas).filter(item => item != selectedJob.executor).map(item => {
                  return <Dropdown.Item key={item} onClick={() => updateExecutor(item)}>{item}</Dropdown.Item>
                }
                )}
              </DropdownButton>
            </h6>}
        </Col>
        <Col lg={3} md={3} sm={3}>
          {!isEmpty(selectedJob) &&
            <h6>Next Run At:
              <Col>
                <DatePicker
                  selected={selectedJob.next_run_at}
                  onChange={updateNextRunAt}
                  showTimeSelect
                  todayButton="Today"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  readOnly={!canEdit}
                /></Col>
            </h6>}
        </Col>
        <Col lg={1} md={1} sm={1}>
          {editAccess && <h6 style={{ float: "right" }}>Edit:  <Toggle checked={canEdit} onChange={() => { setCanEdit(!canEdit) }} /></h6>}
        </Col>
      </Row>
      {(schema) &&
        <Row>
          <Col>
            <Form schema={schema}
              formData={selectedJob.job_config}
              disabled={!canEdit}
              onChange={updateConfig}
              onSubmit={submitJobUpdate}

            />
          </Col>
        </Row>}
    </>
}
export default React.memo(JobSettingsForm)
