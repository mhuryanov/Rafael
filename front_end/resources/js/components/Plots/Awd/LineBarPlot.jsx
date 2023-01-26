import React from 'react';
import { Row, Col } from 'react-bootstrap'
import {
  ComposedChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LabelList
} from 'recharts';
import { useEffect, useState } from 'react';
import { Button } from '@dx/continuum-button'

import { COLOR_ARRAY } from '../../../utilities/constants'
import { getPlotData } from './helpers'
import { BAR } from '../../Pages/TechnologyPage/Awd/constants'

const _ = require('underscore')
const randomColor = require('randomcolor')

const XAxisTick = (props) => {
  const {
    x, y, payload
  } = props;
  const { value } = payload
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={5} textAnchor="end" fill="#666" transform="rotate(-75)" fontSize="small">{value}</text>
    </g>
  )
}

const formatValue = (value) => {
  switch (true) {
    case value >= 1.0e+12:
      return (value / 1.0e+12).toFixed(1) + 'T'
      break
    case value >= 1.0e+9:
      return (value / 1.0e+9).toFixed(1) + 'B'
      break
    case value >= 1.0e+6:
      return (value / 1.0e+6).toFixed(1) + 'M'
      break
    case value >= 1.0e+3:
      return (value / 1.0e+3).toFixed(1) + 'K'
      break
    default:
      return value
  }
}

const YAxisTick = (props) => {
  const {
    x, y, payload, textAnchor
  } = props;
  const { value } = payload
  const tickValue = formatValue(value)
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={5} textAnchor={textAnchor} fill="#666" fontSize="small">{tickValue}</text>
    </g>
  )
}


const renderTotal = ({ x, y, width, value }) => {
  const formattedValue = formatValue(value)
  return (
    <text x={x + width / 2} y={y - 12} textAnchor="middle" dominantBaseline="middle" fontSize="small">
      {formattedValue}
    </text>
  )
}

const CustomizedLabel = (props) => {
    const {
      x, y, stroke, value,
    } = props
  return <text x={x} y={y} dy={-4} fill={stroke} fontSize={10} textAnchor="middle">{`${value}%`}</text>;
}

// data should be formatted as { <category_name>: { <sub_category>: value }}
const LineBarPlot = ({ data, settings }) => {
  const { plotCdf, showPdfValues, categories, plotType } = settings
  const [barChartData, setBarChartData] = useState([])
  const [showLegend, setShowLegend] = useState(false)
  // data contains: category, key, key-HDF, key-CDF, to extract key, exclude category, -HDF, and -CDF
  const subCategories = _.uniq(barChartData.map(bar => (
    Object.keys(bar).filter(field => field !== 'category' && (showPdfValues ? field.includes('-HDF') : (!field.includes('-HDF') && !field.includes('-CDF'))))
  )).flat())

  useEffect(() => {
    const newBarChartData = getPlotData(data, categories)
    setBarChartData(newBarChartData)
  }, [data])

  useEffect(() => {
    if (barChartData.length > 0) {
      setShowLegend(true)
    }
  }, [barChartData])


  return (
    <Col>
      {subCategories.length > 20 && <Button size="small" onClick={() => setShowLegend(prevShowLegend => !prevShowLegend)}>{`${showLegend ? 'Hide' : 'Show'} Legend`}</Button>}
      <ResponsiveContainer width="100%" height={850}>
        <ComposedChart
          data={barChartData}
          margin={{
            top: 5, right: 50, left: 50, bottom: 135,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
            tick={<XAxisTick />}
            interval={0}
            label={{ value: categories.join(','), position: 'bottom', offset: 115 }}
          />
          <YAxis
            yAxisId="left"
            tick={<YAxisTick textAnchor="end" />}
            label={{ value: showPdfValues ? 'Percent (%)' : 'Count', angle: -90, position: 'left', offset: 25 }}
          />
          {plotCdf && (
            <YAxis
              yAxisId="right"
              tick={<YAxisTick textAnchor="start" />}
              label={{ value: 'CDF Percentiles (%)', angle: 90, position: 'right', offset: 25 }}
              orientation="right"
            />
          )}
          <Tooltip />
          {showLegend && <Legend layout="horizontal" verticalAlign="top" align="center" />}
          {barChartData.length > 0 && subCategories.map((subCategory, i) => (
            plotType === BAR ? (
              <Bar yAxisId="left" key={`${subCategory}-bar`} dataKey={subCategory} fill={COLOR_ARRAY[i] || randomColor({ seed: i })} stackId='a'>
                {subCategories.length <= 2 && <LabelList content={renderTotal} dataKey={subCategory} position="top" />}
              </Bar>
            ) : (
              <Line yAxisId="left" key={`${subCategory}-bar`} dataKey={subCategory} fill={COLOR_ARRAY[i] || randomColor({ seed: i })} stroke={COLOR_ARRAY[i] || randomColor({ seed: i })} />
            )
          ))}
          {plotCdf && barChartData.length > 0 && _.uniq(barChartData.map(bar => Object.keys(bar).filter(field => field !== 'category' && field.includes('-CDF'))).flat()).map((subCategory, i) => (
            <Line connectNulls yAxisId="right" key={`${subCategory}-line`} dataKey={subCategory} fill="black" stroke={COLOR_ARRAY[i] || randomColor({ seed: i })} label={subCategories.length <= 2 && <CustomizedLabel />} />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </Col>
  )
}

export default React.memo(LineBarPlot)
