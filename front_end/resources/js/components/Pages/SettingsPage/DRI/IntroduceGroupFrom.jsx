import React, { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import Form from "@rjsf/material-ui"
import { DataGrid, DataGridRow, DataGridColumn } from '@dx/continuum-data-grid'
import { USER_ACCESS_API } from '../../../../utilities/constants'
import { sendToServer } from '../../../../utilities/helpers'
const shortid = require('shortid')
const _ = require('underscore')

const IntroduceGroupFrom = () => {
  const [groupList, setGroupList] = useState([])
  const [newGroup, setNewGroup] = useState({})
  const updateGroups = () => sendToServer(USER_ACCESS_API, {}, 'GET', setGroupList)
  useEffect(() => {
    updateGroups()
  }, [])

  const update_new_group = ({ formData }) => {
    const formDataCleaned = {}
    _.forEach(formData, (value, key) => {
      if (_.isString(value)) {
        value = value.replace(/\s/g, "")
      }
      formDataCleaned[key] = value
    })
    setNewGroup(formDataCleaned)
  }

  const validate = (formData, errors) => {
    groupList.forEach(function (group) {
      if (formData.group_id === group.group_id) {
        errors.group_id.addError("Group ID is already registered");
      }
      if (formData.group_name === group.group_name) {
        errors.group_name.addError("Group Name is already registered");
      }
      if (formData.group_email === group.group_email) {
        errors.group_email.addError("Group Email is already registered");
      }
    });
    return errors;
  }


  const introduceGroupSubmit = () => {
    sendToServer(USER_ACCESS_API, newGroup, 'POST', () => { updateGroups(); setNewGroup({}) }, (error) => {

      setNewGroup({})
    })
  }

  console.log('Rendering Groups Type')
  const schema = {
    "title": "Introduce an Apple Connect Group",
    "type": "object",
    "title": "Create a New Group",
    "required": ["group_id", 'group_email', 'group_name'],
    "properties": {
      "group_id": { "type": "integer", "format": "integer", "title": "Group ID", "minLength": 4 },
      "group_email": { "type": "string", "format": "email", "title": "Group Email" },
      "group_name": { "type": "string", "format": "string", "title": "Group Name" },
    },
  }

  return (


    <Row style={{ marginTop: '15px' }}>
      <Col>
        <Form schema={schema}
          onSubmit={introduceGroupSubmit}
          formData={newGroup}
          onChange={update_new_group}
          validate={validate}
        />
      </Col>
      <Col >
        {(groupList.length) &&
          <DataGrid
            data={groupList}
            variant="striped"
          >
            <DataGridRow>
              {Object.keys(groupList[0]).map((column) => (
                <DataGridColumn key={shortid.generate()} field={column} />
              ))}
            </DataGridRow>
          </DataGrid>}
      </Col>
    </Row>

  )
}

export default React.memo(IntroduceGroupFrom)
