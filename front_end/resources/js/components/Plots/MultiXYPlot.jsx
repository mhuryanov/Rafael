import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { StatePanel } from '@dx/continuum-state-panel'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import Dygraph from 'dygraphs'

import { ARCHIVE_REPORTING_LOGS, KPI_TABLE, KPI_NAMES, FITNESS_FEATURES } from '../../utilities/constants'
import { addToObject, size, formatTimeStamp, isValidArchiveData, createArchiveLabels } from '../../utilities/helpers'
import { useFetchArchiveData } from '../../hooks/fetchData'
import RangeSelect from '../Widgets/RangeSelect'
import { sync } from './synchronize'
import { getPlotLinesData } from './XYPlot'

const shortid = require('shortid')
const _ = require('underscore')

sync(Dygraph)


const ErrorMessage = () => (
  <StatePanel
    message="Error- could not find time series data."
    suggestion="Data may still be processing."
  />
)

const MultiXYPlot = ({ data, lineLabels, xlabel, ylabels }) => {
  const [ids] = useState(Object.keys(data).map(() => shortid.generate()))
  
  useEffect(() => {
    const formattedData = {}
    Object.entries(data).forEach(([name, lines]) => {
      formattedData[name] = getPlotLinesData(lines)
    })
    const newPlots = []
    Object.entries(formattedData).forEach(([name, plotData], i) => {
      newPlots.push(new Dygraph(
        document.getElementById(ids[i]),
        plotData,
        {
          height: 300,
          width: '50%',
          title: name,
          axisLabelFontSize: 12,
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
          ylabel: ylabels[i],
          xlabel,
          labels: ['x'].concat(lineLabels || _.range(data[name].length).map(num => `Run${num + 1}`))
        }
      ))
    })
    if (newPlots.length > 1) {
      Dygraph.synchronize(newPlots, {
        zoom: true,
        selection: true,
        range: false
      })
    }
  }, [data])

  return (
    ids.map(id => (
      <div key={id} style={{ width: '50%' }}>
        <div id={id} className="dygraphs-timeseries" />
      </div>
    ))
  )
}

export default React.memo(MultiXYPlot)
