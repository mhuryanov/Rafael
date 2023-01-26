/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import {
  useHistory
} from 'react-router'
import DayPicker from "react-day-picker";
import "react-day-picker/lib/style.css";

import { useFetchRafaelMulti } from '../../../../hooks/fetchData'
import { ARCHIVE_META_API } from '../../../../utilities/constants'
import { dateToString, addLeadingZeroes, isEmpty, getPipelineCategory } from '../../../../utilities/helpers'


const AwdCalendar = ({
  archives
}) => {
  const history = useHistory()
  const [calendarMapping, setCalendarMapping] = useState({})

  useEffect(() => {
    const newCalendarMapping = {}
    archives.forEach((archive) => {
      const { date } = archive
      if (date in newCalendarMapping) {
        const { pipelinestate } = archive
        const pipelineCategory = getPipelineCategory(pipelinestate)
        if (pipelineCategory === 'PROCESSING') {
          newCalendarMapping[date] = archive
        }
        if (pipelineCategory === 'ERROR') {
          newCalendarMapping[date] = archive
        }
      } else {
        newCalendarMapping[date] = archive
      }
    })
    setCalendarMapping(newCalendarMapping)
  }, [archives])

  const handleModifier = (date, pipelineCategory) => {
    const dateString = dateToString(date).split(' ')[0]
    if (dateString in calendarMapping) {
      const { pipelinestate } = calendarMapping[dateString]
      return getPipelineCategory(pipelinestate) === pipelineCategory
    }
    return false
  }
  const handleDayClick = (date) => {
    const dateString = dateToString(date).split(' ')[0]
    if (dateString in calendarMapping) {
      const { technology, feature, fieldtest } = calendarMapping[dateString]
      history.push(`/technology/${technology}/${feature}/report/${fieldtest}`)
    }
  }

  console.log('rendering AwdCalendar')
  return (
    <div>
      <DayPicker
        showWeekNumbers
        onDayClick={handleDayClick}
        firstDayOfWeek={ 1 }
        modifiers={{
          success: date => handleModifier(date, 'COMPLETE'),
          error: date => handleModifier(date, 'ERROR'),
          processing: date => handleModifier(date, 'PROCESSING')
        }}
      />
    </div>
  )
}

export default React.memo(AwdCalendar)
