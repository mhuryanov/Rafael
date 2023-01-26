import React, { useState, useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart, Label, LabelList
} from 'recharts'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import TableModal from '../Widgets/TableModal'
import { getRandomColor } from '../../utilities/helpers'
import { MONTH_IN_DAYS, WEEK_IN_DAYS, DAY_IN_DAYS, CTP } from '../../utilities/constants'

const StackedBarTTFF = ({ feature, dataToPlot, xKey, dataKeys, width = 600, height = 500 }) => {
  const handleBarClick = (payload) => {
    if (payload && payload.payload) {
      return
    }
  }

  console.log('Rendering StackedBarTTFF')
  return (
    <Row className='justify-content-center'>
      <ComposedChart
        width={width}
        height={height}
        data={dataToPlot}
        margin={{
          top: 20, left: 20, bottom: 25
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {/* {legend} */}
        <XAxis dataKey={xKey}>
          <Label value="Iteration" offset={5} position="bottom" />
        </XAxis>
        <YAxis type="number" domain={[0, upperBound => (Number(upperBound.toFixed(0)))]}>
          <Label value="TTFF (s)" position="left" angle={-90} />
        </YAxis>
        <Tooltip />
        {dataKeys.map((key, index) => (
            <Bar key={key} barSize={80} dataKey={key} stackId="a" 
              fill={getRandomColor(0, index)}
              onClick={handleBarClick} style={{ cursor: 'pointer' }} />
        ))}
      </ComposedChart>
    </Row>
  )
}

export default React.memo(StackedBarTTFF)
