import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import Select from 'react-select'
import { sendToServer } from '../../../../utilities/helpers'
import { USER_ACCESS_API } from '../../../../utilities/constants'
import { Badge } from '@dx/continuum-badge'
const shortid = require('shortid')

const AccessControlForm = ({ technology }) => {
  const [userGroupList, setUserGroupList] = useState(undefined)
  const [groupList, setGroupList] = useState(undefined)
  const [adminGroupList, setAdminGroupList] = useState(undefined)
  const [maintainerGroupList, setMaintainerGroupList] = useState(undefined)
  const [viewerGroupList, setViewerGroupList] = useState(undefined)
  const groupMapping = {
    'Admin': {
      defaultValue: adminGroupList,
      url: `${USER_ACCESS_API}${technology}/ADMIN/access_control/`,
      set: setAdminGroupList
    },
    "Maintainer": {
      defaultValue: maintainerGroupList,
      url: `${USER_ACCESS_API}${technology}/MAINTAINER/access_control/`,
      set: setMaintainerGroupList
    },
    "Viewer": {
      defaultValue: viewerGroupList,
      url: `${USER_ACCESS_API}${technology}/VIEWER/access_control/`,
      set: setViewerGroupList

    }
  }
  const update_users = () => {
    sendToServer(`${USER_ACCESS_API}${technology}/users`, {}, 'GET', setUserGroupList)
  }
  useEffect(() => {
    sendToServer(USER_ACCESS_API, {}, 'GET', (data) => {
      setGroupList(data.map(({ group_name }) => { return { "value": group_name, "label": group_name } }))
    })
    Object.values(groupMapping).map(groupInfo => {
      sendToServer(groupInfo.url, {}, 'GET', (data) => {
        groupInfo.set(data.map(group_name => { return { "value": group_name, "label": group_name } }))
      })
    })
    update_users()

  }, [])

  const handleChangeAccess = (accessType, options) => {
    const group_names = (options) ? options.map(item => { return item.value }) : []
    const groupInfo = groupMapping[accessType]
    sendToServer(groupInfo.url, { group_names }, 'PATCH', () => sendToServer(groupInfo.url, {}, 'GET', (data) => {
      groupInfo.set(data.map(group_name => { return { "value": group_name, "label": group_name } }))
      update_users()
    }))

  }

  return (
    <>
      <Row>
        <Col >
          {groupList !== undefined && Object.keys(groupMapping).map(accessType => {
            return groupMapping[accessType].defaultValue !== undefined && <h6 key={shortid.generate()}>
              {accessType} Access:
              <Select
                options={groupList}
                key={shortid.generate()}
                isMulti
                defaultValue={groupMapping[accessType].defaultValue}
                onChange={(options) => handleChangeAccess(accessType, options)} />
            </h6>

          })
          }
        </Col>
      </Row>

      {userGroupList !== undefined && Object.keys(userGroupList).map(accessType => {
        return <Row key={shortid.generate()}>
          <Col xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}>
            <h6>{accessType} Users: </h6>
          </Col>
          <Col >
            {userGroupList[accessType].map(user => (
              <Badge variant="primary" key={shortid.generate()}>{user}</Badge>
            ))}
          </Col>

        </Row>
      })

      }
    </>
  )
}

export default React.memo(AccessControlForm)
