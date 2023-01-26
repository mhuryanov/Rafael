/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Row, Col
} from 'react-bootstrap'
import { Icons } from '@tidbits/react-tidbits'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { Checkbox } from '@dx/continuum-checkbox'
import { StatePanel } from '@dx/continuum-state-panel'
import Select from 'react-select'

import { useFetchArchiveData } from '../../../../hooks/fetchData'
import { isEmpty, getIndices } from '../../../../utilities/helpers'
import { KPI_TABLE, ARCHIVE_REPORTING_LOGS } from '../../../../utilities/constants'
import Box from '../../../Box'

const XYPlot = lazy(() => import('../../../Plots/XYPlot'))
const MultiXYPlot = lazy(() => import('../../../Plots/MultiXYPlot'))

const _ = require('underscore')

const technology = "R1"
const feature = "OR"

const PLOT_OPTIONS = [
  'Range over Time',
  'RSSI over Time',
  'Yield over Time',
  'RSSI over Range'
]

const ErrorMessage = () => (
  <StatePanel
    message="Error- could not find plot data."
    suggestion="Data may still be processing."
  />
)


const ORDeviceDetails = ({
  archive,
  tab
}) => {
  const { tableName, columns } = KPI_TABLE[technology][feature]
  const [isLoading, archivesInfo] = useFetchArchiveData([archive.id], ARCHIVE_REPORTING_LOGS, tableName, columns)
  const [allPlots, setAllPlots] = useState({})
  const [selectedPlots, setSelectedPlots] = useState([])
  const [checkedPlots, setCheckedPlots] = useState(PLOT_OPTIONS)
  const { errorMessage } = archivesInfo
  
  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const [iosTimeCol, timestampCol, sessionCol, rangeCol, rssiCol, yieldCol] = columns
      const archiveData = archivesInfo[archive.id]
      const newAllPlots = {}
      if (!isEmpty(archiveData)) {
        const uniqueSessions = _.uniq(archiveData[sessionCol])
        uniqueSessions.forEach((session) => {
          const indices = getIndices(archiveData, _.range(archiveData[sessionCol].length), sessionCol, session)
          const [yieldKey] = Object.keys(archiveData).filter(key => key.includes('field') || key.includes('yield')) // special case for yield
          const newTimeSeriesData = {
            'Range over Time': [indices.map(i => [archiveData[timestampCol][i].split(' ').join('T'), archiveData[rangeCol][i]]).sort((a, b) => a[0] > b[0])],
            'RSSI over Time': [indices.map(i => [archiveData[timestampCol][i].split(' ').join('T'), archiveData[rssiCol][i]]).sort((a, b) => a[0] > b[0])],
            'Yield over Time': [indices.map(i => [archiveData[timestampCol][i].split(' ').join('T'), archiveData[yieldKey][i]]).sort((a, b) => a[0] > b[0])]
          }
          const newRangeRssiData = [indices.map(i => [archiveData[rangeCol][i], archiveData[rssiCol][i]]).sort((a, b) => a[0] > b[0])]
          newAllPlots[session] = {
            timeSeriesData: newTimeSeriesData,
            rangeRssiData: newRangeRssiData
          }
        })
      }
      setAllPlots(newAllPlots)
    }
  }, [isLoading, errorMessage, archivesInfo])

  const handleSelectPlot = (options) => {
    const newPlots = options ? options.map(option => option.value) : []
    setSelectedPlots(newPlots)
  }

  const handleDelete = (plotName) => {
    setSelectedPlots(prevPlots => _.without(prevPlots, plotName))
  }

  const handleCheck = (plotType) => {
    if (checkedPlots.includes(plotType)) {
      setCheckedPlots(prevCheckedPlots => _.without(prevCheckedPlots, plotType))
    } else {
      setCheckedPlots(prevCheckedPlots => prevCheckedPlots.concat(plotType))
    }
  }

  console.log('Rendering ORDeviceDetails')
  return (
    tab === 'Plots' && (
      <div style={{ paddingBottom: '100px' }}>
        <Row>
          <Box title=" " subTitle="Select Session Configuration">
            {isEmpty(allPlots) ? (
              <ErrorMessage />
            ) : (
              <div style={{ paddingBottom: '35px', width: '75%' }}>
                <Select
                  isMulti
                  placeholder="Select Session Configuration(s)..."
                  onChange={handleSelectPlot}
                  options={Object.keys(allPlots).map(name => ({ label: name, value: name }))}
                />
                <Row style={{ marginTop: '5px' }}>
                  {PLOT_OPTIONS.map(option => (
                    <Col key={option} style={{ maxWidth: '200px' }}>
                      <Checkbox checked={checkedPlots.includes(option)} onChecked={() => handleCheck(option)}>
                        {option}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Box>
        </Row>
        {selectedPlots.map((name) => {
          const { timeSeriesData, rangeRssiData } = allPlots[name]
          const selectedTimeSeriesData = {}
          checkedPlots.forEach(plotType => {
            if (plotType in timeSeriesData) {
              selectedTimeSeriesData[plotType] = timeSeriesData[plotType]
            }
          })
          return (
            <Row key={name}>
              <Box
                title={
                  <>
                    {name}
                    <span style={{ float: 'right' }}>
                      <Icons.CloseIcon height="15px" width="15px" mt="-3px" color="error" onClick={() => handleDelete(name)} cursor="pointer" />
                    </span>
                  </>
                }
                isLoading={isLoading}>
              <>
                <MultiXYPlot
                  key={checkedPlots.join('')}
                  data={selectedTimeSeriesData}
                  xlabel="Time"
                  ylabels={['Range (m)', 'RSSI (dBm)', 'Yield (%)']}
                />
                {checkedPlots.includes('RSSI over Range') && (
                  <XYPlot
                    lines={rangeRssiData}
                    xlabel="Range (m)"
                    ylabel="RSSI (dBm)"
                    title="RSSI over Range"
                  />
                )}
                </>
              </Box>
            </Row>
          )
        }
      )}
        <div className="spinner-gray"><Spinner visible={isLoading} /></div>
      </div>
    )
  )
}

ORDeviceDetails.propTypes = {
  archives: PropTypes.array.isRequired
}

export default React.memo(ORDeviceDetails)
