/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React from 'react'
import { Spinner, Row, Col } from 'react-bootstrap'
import { Suspense, lazy } from 'react';
import {
  Route,
  Switch,
  Redirect,
  useParams
} from 'react-router-dom'
const SearchBody = lazy(() => import('./SearchBody'))
const ArchiveFilter = lazy(() => import('./ArchiveFilter/ArchiveFilter'))

const SearchPage = () => {

  console.log('Rendering SearchPage')
  return (
    <Suspense fallback={<Spinner animation="border" variant="info" />}>
      <Row className='justify-content-center page-container'>
        <Col sm={{ span: 10, offset: 2}} style={{ width: '70%', padding: '0 5% 5% 5%' }}>
          <ArchiveFilter />
        </Col>
        <Col sm={{ span: 10, offset: 2}} style={{ width: '70%', padding: '0 5% 5% 5%' }}>
          <SearchBody />
        </Col>
      </Row>
    </Suspense>
  )
}

export default React.memo(SearchPage)