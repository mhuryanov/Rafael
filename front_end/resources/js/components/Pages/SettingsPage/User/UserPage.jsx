import React from 'react'
import { Row, Col } from 'react-bootstrap'

import UserForm from './UserForm'
import UserFavorites from './UserFavorites'


const UserPage = () => {

  console.log('Rendering UserPage')
  return (
    <>
      <Row>
        <Col className="box">
          <UserForm />
        </Col>
      </Row>
      <Row>
        <Col className="box">
          <UserFavorites />
        </Col>
      </Row>
    </>
  )
}

export default React.memo(UserPage)
