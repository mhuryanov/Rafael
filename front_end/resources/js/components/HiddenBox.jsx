/* eslint-disable react/prop-types */
import React, { useState, Suspense } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Text, Icons } from '@tidbits/react-tidbits'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import HelpTooltip from './Widgets/HelpTooltip'

const HiddenBox = ({
  title, subTitle, type, isLoading, children
}) => {
  const [visibility, setVisibility] = useState('hidden')
  
  const handleVisibility = () => {
    setVisibility((prevVisibility) => {
      if (prevVisibility === 'hidden') return 'visible'
      else return 'hidden'
    })
  }

  return (
    <Col className={`box ${type}`}>
      <h1 className="plot-title time-series-dropdown" onClick={handleVisibility} style={{ marginTop: '25px', cursor: 'pointer' }}>
        {title} &nbsp;
        {visibility === 'hidden' ? (
          <span style={{ fontSize: '12px' }}>
            (Click to show) <Icons.DownIcon width="15px" height="15px" />
          </span>
        ) : (
          <span>
            <Icons.UpIcon width="15px" height="15px" />
            {type === 'time-series-plot' && <HelpTooltip content="Click and drag to zoom in. Double-click to reset view."/>}
          </span>
        )}
      </h1>
      {subTitle && (
        <Row className="justify-content-center">
          <Text textStyle="h5Emph" mb="15px">{subTitle}</Text>
        </Row>
      )}
      <Row className='justify-content-center zero-margin' style={{ visibility, width: '100%', position: visibility === 'hidden' ? 'absolute' : 'relative' }}>
        <Suspense fallback={<Spinner visible />}>
          {React.cloneElement(children, { visible: visibility === 'visible' })}
        </Suspense>
      </Row>
      <Spinner visible={isLoading} />
    </Col>
  )
}

export default React.memo(HiddenBox)
