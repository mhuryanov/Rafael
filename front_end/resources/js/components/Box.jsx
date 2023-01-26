/* eslint-disable react/prop-types */
import React, { Suspense } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Text } from '@tidbits/react-tidbits'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

const Box = ({
  title, subTitle, type, isLoading, children, style = {}
}) => {
  return (
    <Col className={`box ${type}`} style={style}>
      {title && (
        <h1 className="plot-title" style={{ marginTop: '25px' }}>
          {title}
        </h1>
      )}
      {subTitle && (
        <Row className="justify-content-center">
          <Text textStyle="h5Emph" mb="15px">{subTitle}</Text>  
        </Row>
      )}
      <Row className='justify-content-center zero-margin'>
        <Suspense fallback={<Spinner visible />}>
          {children}
        </Suspense>
      </Row>
      <Spinner visible={isLoading} />
    </Col>
  )
}

export default React.memo(Box)
