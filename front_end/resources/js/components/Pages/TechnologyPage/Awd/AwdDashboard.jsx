/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useRef } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { Button } from '@dx/continuum-button'
import { Checkbox } from '@dx/continuum-checkbox'

import { useFetchRafael } from '../../../../hooks/fetchData'
import { TABLE_API } from '../../../../utilities/constants'
import { DEFAULT_PLOTS } from './constants'
import AwdPlotContainer from './AwdPlotContainer'
import SideNav from '../../../Widgets/SideNav'
import AwdEditPane from './AwdEditPane'

const _ = require('underscore')
const shortid = require('shortid')

const technology = 'AWD'


const AwdDashboard = ({
  archives,
  feature,
  isWeekBased
}) => {
  const endOfPageRef = useRef(null)
  const [isLoadingTables, fetchedTables] = useFetchRafael({ url: `${TABLE_API}by_technology/${technology}` })
  const [navContent, setNavContent] = useState(null)
  const [plots, setPlots] = useState(DEFAULT_PLOTS[feature])

  const handleCreatePlot = (plotId) => {
    const name = prompt('Enter a name for new plot')
    if (name) {
      const newPlot = {
        id: plotId,
        name,
        tableInfo: {},
        settings: {},
        data: {}
      }
      setPlots(prevPlots => prevPlots.concat(newPlot))
      endOfPageRef.current.scrollIntoView()
    }
  }

  const handleCheck = (newPlot) => {
    const matchingPlot = _.find(plots, plot => plot.id === newPlot.id)
    if (matchingPlot) {
      setPlots(prevPlots => _.without(prevPlots, matchingPlot))
    } else {
      setPlots(prevPlots => prevPlots.concat(newPlot))
    }
  }

  const handleCancel = () => {
    setNavContent(null)
  }

  console.log('rendering AwdDashboard')
  return (
    <div>
      <Button variant="primary" onClick={() => handleCreatePlot(shortid.generate())}>Create New Plot</Button>
      <Row style={{ marginTop: '15px' }}>
        {DEFAULT_PLOTS[feature].map(plot => (
          <Col key={plot.id}>
            <Checkbox checked={_.find(plots, p => p.id === plot.id)} onChecked={() => handleCheck(plot)}>
              {plot.name}
            </Checkbox>
          </Col>
        ))}
      </Row>
      <Row>
        {plots.map(plot => (
          <AwdPlotContainer
            key={`${plot.id}-${isWeekBased ? 'week' : 'day'}`}
            archives={archives}
            feature={feature}
            defaultPlot={plot}
            setNavContent={setNavContent}
            isWeekBased={isWeekBased}
          />
        ))}
      </Row>
      <div ref={endOfPageRef} />
      {navContent && (
        <SideNav elementId="edit-side-nav" contentKey={navContent.plot.id}>
          <AwdEditPane
            key={navContent.plot.id}
            feature={feature}
            plot={navContent.plot}
            setPlot={navContent.setPlot}
            fetchedTables={fetchedTables}
            uniqueValues={navContent.uniqueValues}
            handleCancel={handleCancel}
          />
          <div className="spinner-gray"><Spinner visible={isLoadingTables} /></div>
        </SideNav>
      )}
    </div>
  )
}

export default React.memo(AwdDashboard)
