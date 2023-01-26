/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import {
  Route
} from 'react-router'
import { Button } from '@dx/continuum-button'

import { isEmpty } from '../../../../utilities/helpers'
import { BAR, LINE, MAP } from './constants'
import { StatePanel } from '@dx/continuum-state-panel'

const LineBarPlot = lazy(() => import('../../../Plots/Awd/LineBarPlot'))
const HeatMap = lazy(() => import('../../../Plots/Awd/HeatMap'))

const AwdPlot = ({
  plot
}) => {
  if (isEmpty(plot)) return null
  const { settings, data } = plot
  if (isEmpty(data)) return <StatePanel message="No data found." />
  const { plotType } = settings
  switch (true) {
    case plotType === BAR || plotType === LINE:
      return (
        <Suspense fallback={<Spinner visible />}>
          <LineBarPlot data={data} settings={settings} />
        </Suspense>
      )
    case plotType === MAP:
      return (
        <Suspense fallback={<Spinner visible />}>
          <HeatMap data={data} settings={settings} />
        </Suspense>
      )
    default:
      return <StatePanel message="Please configure plot settings." />
  }
}

export default React.memo(AwdPlot)
