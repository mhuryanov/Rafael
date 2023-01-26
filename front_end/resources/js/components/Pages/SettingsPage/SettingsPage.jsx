/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import {
  Route,
  Switch,
  Redirect,
  useParams
} from 'react-router-dom'

import DriPage from './DRI/DriPage'
import UserPage from './User/UserPage'
import AdminPage from './Admin/AdminPage'
import SettingsList from './SettingsList'

const SettingsPage = () => {

  console.log('Rendering SettingsPage')
  return (
    <Row className="page-container">
      <Col style={{ minWidth: '250px', maxWidth: '250px' }}>
        <Route path={'/settings/:setting'} >
          <SettingsList />
        </Route>
      </Col>
      <Col style={{ margin: '25px' }}>
        <Switch>
          <Route exact path={`/settings/dri/:technology`}>
            <DriPage />
          </Route>
          <Route exact path={`/settings/admin`}>
            <AdminPage />
          </Route>
          <Route exact path={`/settings/dri`}>
            <DriPage />
          </Route>
          <Route exact path={`/settings/user`}>
            <UserPage />
          </Route>
          <Route path={`/settings`}>
            <Redirect to='/settings/user' />
          </Route>
        </Switch>
      </Col>
    </Row>
  )
}

export default React.memo(SettingsPage)