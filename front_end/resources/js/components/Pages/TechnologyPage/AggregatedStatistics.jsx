/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'

import { ARCHIVE_FILTER_QUERY } from '../../../utilities/constants'
import { buildQueryString, getArchiveFilterParams, isValidPipelineState } from '../../../utilities/helpers'
import { useFetchRafael } from '../../../hooks/fetchData'
import Filter from '../../Widgets/Filter'
import Box from '../../Box'

const _ = require('underscore')
const shortid = require('shortid')

const Aggregated = lazy(() => import('../../Plots/Aggregated'))
const AggregatedGFPlot = lazy(() => import('../../Plots/AggregatedGFPlot'))

const DEVICE_TYPES = [
  'D10/D11',
  'D2x',
  'D3x',
  'D4x',
  'D5x',
  'D6x',
  'D16/D17',
  'D79x',
  'N104x',
  'N841x',
  'N14x',
  'N15x',
  'N18x'
]

const BUILD_TRAINS = [
  'AzulE',
  'AzulF',
  'AzulG',
  'Sky',
  'SkyB',
  'SkyC',
  'SkyD',
  'SkyEcho',
  'Sydney',
  'HunterE',
  'HunterF',
  'HunterG',
  'Jupiter',
  'JupiterB',
  'JupiterC',
  'JupiterD',
  'JupiterE',
  'Kincaid',
]

const GROUP_BY = 'archive'

const getDeviceTypeQueryString = (deviceTypes) => {
  let queryString = ''
  deviceTypes.forEach((deviceType) => {
    if (deviceType.includes('/')){
      deviceType.split('/').forEach((item) => {
        queryString += `${queryString === '' ? '' : 'OR '}fieldtests_archive.model_hardware LIKE '${item}%'`
      })
    }
    else{
      const formattedDeviceType = deviceType.replace('x', '%')
      queryString += `${queryString === '' ? '' : 'OR '}fieldtests_archive.model_hardware LIKE '${formattedDeviceType}'`
    }  
  })
  if (queryString !== '' ) {
    return ` AND (${queryString})`
  }
}

const getBuildTrainQueryString = (buildTrains) => {
  let queryString = ''
  buildTrains.forEach((buildTrain) => {
    queryString += `${queryString === '' ? '' : 'OR '}fieldtests_archive.build_train LIKE '${buildTrain}'`
  })
  if (queryString !== '' ) {
    return ` AND (${queryString})`
  }
}

const modifiedQueryString = (technology, feature, startDate, endDate, deviceTypes, buildTrains) => {
  let queryString = ''
  if (startDate !== null) {
    const baseQueryString = buildQueryString({
      technology,
      feature,
      startDate,
      endDate,
      excludeSpecial: true,
    })
    const deviceTypeQueryString = getDeviceTypeQueryString(deviceTypes)
    const buildTrainQueryString = getBuildTrainQueryString(buildTrains)
    if (deviceTypeQueryString && buildTrainQueryString) {
      queryString = baseQueryString
      + deviceTypeQueryString 
      + buildTrainQueryString
    }
  }
  return queryString
}

const AggregatedStatistics = ({
  technology,
  feature,
  dateState
}) => {
  const { startDate, endDate } = dateState
  const [filters, setFilters] = useState({
    deviceTypes: technology === 'CLX'? ['D10/D11', 'D2x', 'D3x', 'D4x', 'D5x', 'D6x', 'D16/D17'] : ['D4x', 'D5x', 'D6x', 'D16/D17'],
    buildTrains: ['AzulG', 'Sky', 'SkyB', 'Sydney']
  })
  const { deviceTypes, buildTrains } = filters
  const queryString = modifiedQueryString(technology, feature, startDate, endDate, deviceTypes, buildTrains)
  const url = queryString ? ARCHIVE_FILTER_QUERY : ''
  const [isLoading, queryResults] = useFetchRafael(getArchiveFilterParams(queryString, GROUP_BY, url), [])
  const [archives, setArchives] = useState([])

  useEffect(() => {
    if (!isLoading) {
      setArchives(
        _.map(queryResults, (archive, archiveId) => archive[0])
        .filter(archive => isValidPipelineState(archive.pipelinestate))
      )
    }

  }, [isLoading, queryResults])

  console.log('Rendering AggregatedStatistics')
  return (
    <>
      <Row>
        <Col className="fieldtest-filter">
          <Filter
            title="Filter by Device Type"
            type="deviceTypes"
            items={DEVICE_TYPES}
            filters={filters}
            setFilters={setFilters}
          />
        </Col>
        <Col className="fieldtest-filter">
          <Filter
            title="Filter by Build"
            type="buildTrains"
            items={BUILD_TRAINS}
            filters={filters}
            setFilters={setFilters}
          />
        </Col>
      </Row>
      <Row>
        {technology === 'CLX' && (
          <Box title="Aggregated Statistics" type="aggregated-statistics" isLoading={isLoading}>
            <div className="aggregated-plot-container">
              <AggregatedGFPlot
                key={shortid.generate()}
                archives={archives}
              />
            </div>
          </Box>
        )}
        {technology === 'E911' && (
          <>
          <Box title="Aggregated Statistics (Percent of Error)" type="aggregated-statistics" isLoading={isLoading}>
            <div className="aggregated-plot-container">
              <Aggregated
                key={shortid.generate()}
                archives={archives}
                technology={technology}
                feature={feature}
                selectedKpi="Percent of Error <"
              />
            </div>
          </Box>
          <Box title="Aggregated Statistics (Altitude Error)" type="aggregated-statistics" isLoading={isLoading}>
            <div className="aggregated-plot-container">
              <Aggregated
                key={shortid.generate()}
                archives={archives}
                technology={technology}
                feature={feature}
                selectedKpi="percentiles"
              />
            </div>
          </Box>
          </>
        )}
        {!['CLX', 'E911'].includes(technology) && (
          <Box title="Aggregated Statistics" type="aggregated-statistics" isLoading={isLoading}>
            <div className="aggregated-plot-container">
              <Aggregated
                key={shortid.generate()}
                archives={archives}
                technology={technology}
                feature={feature}
                selectedKpi="percentiles"
              />
            </div>
          </Box>
        )}
      </Row>
    </>
  )
}

export default React.memo(AggregatedStatistics)
