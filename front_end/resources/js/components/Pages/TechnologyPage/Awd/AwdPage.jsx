/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { Text } from '@tidbits/react-tidbits'
import { Toggle } from '@dx/continuum-toggle'

import { useFetchRafael } from '../../../../hooks/fetchData'
import Box from '../../../Box'
import { buildQueryString, dateToString, getArchiveFilterParams, isValidPipelineState, addLeadingZeroes } from '../../../../utilities/helpers'
import { ARCHIVE_META_API } from '../../../../utilities/constants'
import HelpTooltip from '../../../Widgets/HelpTooltip'
import { TooltipContent } from '../ReportCatalog'

const AwdCalendar = lazy(() => import('./AwdCalendar'))
const AwdDashboard = lazy(() => import('./AwdDashboard'))
const technology = 'AWD'


const getDefaultAggregation = (feature) => {
  switch (feature) {
    case 'E911':
      return true
    default:
      return false
  }
}

const AwdPage = ({
  feature,
  dateState
}) => {
  const { startDate, endDate, dateRange } = dateState
  const isValidTimeRange = dateRange.label !== 'Custom Range' || (startDate && endDate)
  const queryString = buildQueryString({ technology, feature })
  const [isLoading, fetchedArchives] = useFetchRafael(getArchiveFilterParams(queryString, 'archive'))
  const [archives, setArchives] = useState([])
  const [filteredArchives, setFilteredArchives] = useState([])
  const [isWeekBased, setIsWeekBased] = useState(getDefaultAggregation(feature))

  useEffect(() => {
    if (!isLoading) {
      const newArchives = Object.values(fetchedArchives)
      .flat()
      .map((archive) => {
        const { archive_name: date } = archive
        const [year, month, day] = date.split('-')
        const newDate = `${year}-${addLeadingZeroes(Number(month))}-${addLeadingZeroes(Number(day))}`
        return {
          ...archive,
          date: newDate
        }
      })
      setArchives(newArchives)
      if (isValidTimeRange) {
        const newFilteredArchives = newArchives
        .filter((archive, i) => {
          const { date } = archive
          return (
            date >= dateToString(startDate).split(' ')[0]
            && date <= dateToString(endDate || new Date()).split(' ')[0]
          )
        })
        .filter(archive => isValidPipelineState(archive.pipelinestate))
        setFilteredArchives(newFilteredArchives)
      } else {
        setFilteredArchives([])
      }
    }
  }, [fetchedArchives, startDate, endDate])

  const handleToggle = () => {
    setIsWeekBased(prev => !prev)
  }

  return (
    <div>
      <Col style={{ marginBottom: '10px' }}>
        <Text mr="5px" style={{ display: 'inline' }}>Use Week Aggregation</Text>
        <Toggle
          style={{ display: 'inline' }}
          checked={isWeekBased}
          onChange={handleToggle}
        />
      </Col>
      {filteredArchives.length > 0 ? (
        <Suspense fallback={<div className="spinner-gray"><Spinner visible /></div>}>
          <AwdDashboard archives={filteredArchives} feature={feature} isWeekBased={isWeekBased} />
        </Suspense>
      ) : (
        isValidTimeRange ? (
          <Col>No data found for this time range.</Col> 
        ) : (
          <Col>Please select a time range. Use the calendar to see which days have been processed.</Col>
        ))}
      <Box title={<>
          Processed Archives
          <HelpTooltip title="Calendar Color Legend" content={<TooltipContent />}/>
        </>
      } type="awd-calendar">
        <AwdCalendar archives={archives} />
      </Box>
      <div className="spinner-gray"><Spinner visible={isLoading} /></div>
    </div>
  )
}

export default React.memo(AwdPage)
