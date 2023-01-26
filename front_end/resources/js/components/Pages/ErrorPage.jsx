import React from 'react'
import { Jumbotron, Row } from 'react-bootstrap'
import { StatePanel } from '@dx/continuum-state-panel'
import { Icon } from '@dx/continuum-icon'

const ErrorPage = () => {
  
  console.log('Rendering ErrorPage')
  return (
    <Row className="page-container">
      <Jumbotron className="box error">
        <StatePanel message="Something went wrong" suggestion="Please try again" image={<Icon name="reset-circle" color="redDark" size="extraLarge" />} />
        <div>
          Submit an issue on <a href="http://github.pie.apple.com/keylime/rafael">Github</a>
        </div>
      </Jumbotron>
    </Row>
  )
}

export default React.memo(ErrorPage)
