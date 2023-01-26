import React, { useEffect, useState, useRef } from 'react'
import { Row, Col } from 'react-bootstrap'
import { StatePanel } from '@dx/continuum-state-panel'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import Dygraph from 'dygraphs'

import { COLOR_ARRAY } from '../../utilities/constants'
import { shapes } from './shapes'

shapes(Dygraph)

const shortid = require('shortid')
const _ = require('underscore')


const ErrorMessage = () => (
  <StatePanel
    message="Error- could not find time series data."
    suggestion="Data may still be processing."
  />
)


export const getPlotLinesData = (lines) => {
  let data = ''
  lines.forEach((line, i) => {
    line.forEach((point) => {
      const [x, y] = point
      let entry = ''
      entry += `${x},`
      _.range(lines.length).forEach((num) => {
        if (i === num) entry += y
        entry += ','
      })
      entry = entry.replace(/.$/, '\n')
      data += entry
    })
  })
  return data
}

const getSeries = (numLines, lineLabels) => {
  const series = {}
  if (lineLabels) {
    lineLabels.forEach((label) => {
      series[label] = {
        color: COLOR_ARRAY[label],
      }
    })
  } else {
    _.range(numLines).forEach((num) => {
      series[`Run${num + 1}`] = {
        color: COLOR_ARRAY[num],
      }
    })
  }
  return series
}

// A line is an array of points, with the format [[x1, y1], [x2,y2], ...]
const XYPlot = ({ lines, lineLabels, xlabel, ylabel, title }) => {
  const plotRef = useRef(null)
  const numLines = lines.length

  useEffect(() => {
    const data = getPlotLinesData(lines)
    const newPlot = new Dygraph(
      plotRef.current,
      data,
      {
        height: 300,
        width: '50%',
        title,
        labels: ['x'].concat(lineLabels || _.range(numLines).map(num => `Run${num + 1}`)),
        axisLabelFontSize: 12,
        xValueParser: x => Number(x),
        axes: {
          x: {
            pixelsPerLabel: 120
          }
        },
        strokeWidth: 0,
        drawPoints: true,
        pointSize: 3,
        highlightSeriesOpts: {
          strokeBorderWidth: 1,
          highlightCircleSize: 5
        },
        ylabel,
        xlabel,
        series: getSeries(numLines, lineLabels)
      }
    )
  }, [lines])

  return (
    <div style={{ width: '50%' }}>
      <div className="dygraphs-timeseries" ref={plotRef} />
    </div>
  )
}

export default React.memo(XYPlot)
