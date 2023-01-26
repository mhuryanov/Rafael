import React, { useContext } from 'react'
import { Jumbotron, Button, Row, Col } from 'react-bootstrap'
import {
  Redirect
} from 'react-router-dom'
import { StatePanel } from '@dx/continuum-state-panel'
import { StateContext } from '../../StateContext'

const HomePage = () => {
  const { userPreferences } = useContext(StateContext)
  const { homePreferences } = userPreferences
  const { value: homePath } = homePreferences

  if (homePath !== '/') {
    return <Redirect to={homePath} />
  }

  console.log('Rendering HomePage')
  return (
    <Row className="page-container">
      <Jumbotron className="landing box">
        <p className="landing-title">Welcome to <span style={{ letterSpacing: 'normal', fontWeight: 'normal' }} className="keylime">Key Lime Pie</span></p>
        <StatePanel message="" suggestion="" />
      </Jumbotron>
    </Row>
  )
}

export default React.memo(HomePage)
