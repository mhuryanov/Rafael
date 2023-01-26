import React from 'react';
import { Row, Col } from 'react-bootstrap'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer
} from 'recharts';
import { useEffect, useState } from 'react';

import { COLOR_ARRAY } from '../../utilities/constants'

const getBarChartData = (data) => {
  const barChartData = []
  Object.entries(data).forEach(([group, items]) => {
    const dataEntry = { group }
    Object.entries(items).sort((a, b) => a[0] > b[0]).forEach(([item, value]) => {
      dataEntry[item] = value
    })
    barChartData.push(dataEntry)
  })
  return barChartData
}

const renderTotal = ({ x, y, width, value }) => {
  let formattedValue
  switch (true) {
    case width < 30:
      formattedValue = Number(value).toFixed(0)
      break
    case width < 50:
      formattedValue = Number(value).toFixed(1)
      break
    default:
      formattedValue = Number(value).toFixed(2)
      break
  }
  return (
    <text x={x + width / 2} y={y - 12} textAnchor="middle" dominantBaseline="middle" fontSize="small">
      {formattedValue}
    </text>
  )
}


// data should be formatted as { <group_name>: { <item_name>: value }}
const GroupBarPlot = ({ data, title }) => {
  const [barChartData, setBarChartData] = useState([])

  useEffect(() => {
    const newBarChartData = getBarChartData(data)
    setBarChartData(newBarChartData)
  }, [data])

  return (
    <Col style={{ minWidth: '600px', maxWidth: '800px', margin: '50px' }}>
      <div className="cdf-title" style={{ textAlign: 'center', fontSize: '16px' }}>{title}</div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={barChartData}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="group" />
          {title.includes('%') ? (
            <YAxis ticks={[0, 25, 50, 75, 100]} domain={[0, 110]}/>
          ) : (
            <YAxis domain={[0, dataMax => Math.ceil(dataMax * 1.1)]}/>
          )}
          <Tooltip />
          <Legend />
          {barChartData.length > 0 && Object.keys(barChartData[0]).filter(field => field !== 'group').map((item, i) => (
            <Bar key={item} dataKey={item} fill={COLOR_ARRAY[i * 3]}>
              <LabelList content={renderTotal} dataKey={item} position="top" />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Col>
  )
}

export default React.memo(GroupBarPlot)
