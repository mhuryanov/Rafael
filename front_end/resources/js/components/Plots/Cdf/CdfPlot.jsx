import React from 'react'
import { Row, Col } from 'react-bootstrap'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

import { 
  KPI_NAMES,
  TTFF_KPI_MAPPING,
} from '../../../utilities/constants'

const _ = require('underscore')

const XAxisLabel = ({ value, viewBox }) => {
  const {x, y, width, height} = viewBox
  return (
    <text fontSize="small" x={x + width / 2} y={y + 35} textAnchor="middle">{value}</text>
  )
}

const YAxisLabel = ({ value, viewBox }) => {
  const {x, y, width, height} = viewBox
  return (
    <text fontSize="small" transform={`translate(${x + 5}, ${Math.floor(height/2)}) rotate(-90)`} textAnchor="middle">{value}</text>
  )
}

const YAxisTick = ({ x, y, payload }) => {
  const { value } = payload
  return <text fontSize="small" x={x} y={y+2} textAnchor="end">{value}</text>
}

const XAxisTick = ({ x, y, payload }) => {
  const { value } = payload
  const tickValue = (
    Number(value) >= 10000
      ? Number(value).toExponential()
      : (Number(value) >= 10 || Number(value) === 0)
        ? Number(value).toFixed(0)
        : Number(value).toFixed(2)
  )
  return <text fontSize="small" x={x} y={y+9} textAnchor="middle">{tickValue}</text>
}

const getFormattedPercentile = (percentile, label) => {
  if (label === 'reference') {
    if (percentile === 100) {
      return 99.9
    }
    if (percentile === 0) {
      return 0.1
    }
  }
  return percentile
}

const renderTooltip = ({ active, payload }, archiveLabels) => {
  if (active && Array.isArray(payload) && payload.length > 0) {
    const { percentile, ...archives_items } = payload[0].payload
    return (
      <div className="custom-tooltip">
        {Object.keys(archives_items).map(archive_item => {
          const [archiveId, item]= archive_item.split(' ')
          const display_archive_label = archiveId in archiveLabels ? archiveLabels[archiveId].label.split('_')[0] : archiveId
          const item_name = item ? `(${item})` : ''

          return (
            <div key={archiveId} style={{ fontSize: '12px' }}>
              <span className="color-block" style={{ backgroundColor: archiveId in archiveLabels ? archiveLabels[archiveId].color : 'black' }} />
              <span>
                {`${display_archive_label}${item_name} ${getFormattedPercentile(percentile, archiveId)}%: ${Number(archives_items[archive_item]).toFixed(3)}`}
              </span>
            </div>
          )
          }
        )}
      </div>
    )
  }
  return null
}

const getKpiName = (technology, feature, filters, kpi, reportType='') => {
  if (reportType === 'NMEA'){
    const { additional_filter } = filters.customFilters
    if (additional_filter) {
      const nmea_report_type = additional_filter.value
      return KPI_NAMES[reportType][nmea_report_type][kpi] || kpi 
    } else {
      return KPI_NAMES[reportType]["cno"][kpi] || kpi 
    } 
  } 
  if (technology !== 'GNSS') return kpi
  if (technology === 'GNSS' && feature === 'TTFF' && reportType === '') {
    const { customFilters } = filters
    const { source, table_name } = customFilters
    return TTFF_KPI_MAPPING[source][table_name][kpi]
  }
  return KPI_NAMES[technology][kpi] || kpi  
}

// cdfs should be formatted as so: { <kpi_name>: [{ percentile: value, <archiveId>: value, <archiveId2>: value, ... }, { ... }] }
const CdfPlot = ({ technology, feature, filters, archiveLabels, cdfs, title, reportType='' }) => {
  return (
    Object.entries(cdfs).map(([kpi, data]) => (
      <Col
        sm="6"
        className="cdf-plot"
        key={kpi}
      >
        <div className='cdf-title'>{`${title ? `${title}, `: ''}${getKpiName(technology, feature, filters, kpi, reportType)}`}</div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            layout="vertical"
            data={data}
            margin={{
              top: 5, right: 30, left: 20, bottom: 20,
            }}
          >
            <XAxis
              type="number"
              tick={<XAxisTick />}
              label={<XAxisLabel value={getKpiName(technology, feature, filters, kpi, reportType)} />}
              domain={[0, dataMax => dataMax > 1 ? Math.ceil(dataMax) : dataMax * 1.1]}
            />
            <YAxis
              dataKey="percentile"
              ticks={[0, 25, 50, 75, 100]}
              tick={<YAxisTick />}
              label={<YAxisLabel value="Percentile (%)" />}
              reversed
            />
            {Object.keys(data[0]).filter(entry => entry !== 'percentile').map(entry => (
              <Line
                key={entry}
                isAnimationActive={false}
                type="monotone"
                dataKey={entry}
                stroke={entry !== 'reference' ? archiveLabels[entry.split(' ')[0]].color : 'black'}
                strokeWidth={2}
                dot={false}
              />
            ))}
            <Tooltip position={{ x: -120, y: -10 }} allowEscapeViewBox={{ x: true, y: true }} content={props => renderTooltip(props, archiveLabels)} />
          </LineChart>
        </ResponsiveContainer>
      </Col>
    ))
  )
}

export default React.memo(CdfPlot)
