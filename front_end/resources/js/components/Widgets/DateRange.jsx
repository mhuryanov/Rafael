import React, {
  useLayoutEffect, useState, Suspense, lazy
} from 'react'

import { Col, Row } from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import Select from 'react-select'

import 'react-datepicker/dist/react-datepicker.css'

import { getPreviousDate, differenceInDays } from '../../utilities/helpers'
import {
  YEAR_IN_DAYS, MONTH_IN_DAYS, WEEK_IN_DAYS, DAY_IN_DAYS
} from '../../utilities/constants'

export const DEFAULT_DATE_RANGE_OPTION = { label: 'Last 4 Weeks', value: 4 * WEEK_IN_DAYS }
export const DEFAULT_YES_NO = [{ label: 'Yes', value: true }, { label: 'No', value: false }]
export const DEFAULT_DATE_RANGE_OPTIONS = [
  { label: 'Last 7 Days', value: WEEK_IN_DAYS },
  { label: 'Last 2 Weeks', value: 2 * WEEK_IN_DAYS },
  { label: 'Last 4 Weeks', value: 4 * WEEK_IN_DAYS },
  { label: 'Last 3 Months', value: 3 * MONTH_IN_DAYS },
  { label: 'Custom Range', value: 'custom' }
]

const DEFAULT_GROUP_OPTION = { label: 'Default', value: null }

const DEFAULT_GROUP_OPTIONS = [
  { label: 'Day', value: DAY_IN_DAYS },
  { label: 'Week', value: WEEK_IN_DAYS },
  { label: 'Month', value: MONTH_IN_DAYS },
  { label: 'Default', value: null }
]

const DateRange = ({
  dateState, setDateState, dateRangeOptions, defaultDateRange, showDateGroup
}) => {
  const {
    dateRange = DEFAULT_DATE_RANGE_OPTION, startDate, endDate, dateGroup
  } = dateState
  const [showCustomFilter, setShowCustomFilter] = useState(false)
  const [groupOptions, setGroupOptions] = useState([])
  const timeDifference = differenceInDays(startDate, endDate)

  useLayoutEffect(() => {
    if (dateGroup) {
      const newGroupOptions = (
        timeDifference === null
          ? DEFAULT_GROUP_OPTIONS
          : DEFAULT_GROUP_OPTIONS.filter(option => option.value * 2 <= timeDifference)
      )
      const matchingOptions = (
        dateGroup === null
          ? []
          : newGroupOptions.filter(option => option.label === dateGroup.label)
      )
      if (matchingOptions.length === 0) {
        setDateState(prevState => ({ ...prevState, dateGroup: DEFAULT_GROUP_OPTION }))
      }
      setGroupOptions(newGroupOptions)
    }
  }, [timeDifference])

  useLayoutEffect(() => {
    if (dateRange.value !== 'custom') {
      setShowCustomFilter(false)
    } else {
      setShowCustomFilter(true)
    }
  }, [dateRange.value])

  const handleDateRangeSelect = (option) => {
    if (option.value === 'custom') {
      setShowCustomFilter(true)
      setDateState(prevState => ({
        ...prevState,
        startDate: null,
        endDate: null,
        dateRange: option
      }))
    } else {
      setDateState(prevState => ({
        ...prevState,
        dateRange: option,
        startDate: getPreviousDate(option.value),
        endDate: null
      }))
    }
  }

  return (
    <Row className="date-range">
      <Col style={{ maxWidth: '210px', minWidth: '210px' }}>
        <div>Date Range</div>
        <Select
          value={dateRange}
          onChange={handleDateRangeSelect}
          options={dateRangeOptions || DEFAULT_DATE_RANGE_OPTIONS}
          defaultValue={defaultDateRange || DEFAULT_DATE_RANGE_OPTION}
        />
      </Col>
      {showCustomFilter && (
        <Col>
          <Row style={{ height: '100%' }}>
            <Col>
              <div>Start Date</div>
              <DatePicker
                placeholderText="Select a Start Date"
                selected={dateState.startDate}
                onChange={date => setDateState(prevState => ({ ...prevState, startDate: date }))}
                maxDate={dateState.endDate || new Date()}
                dateFormat="yyyy-MM-dd"
              />
            </Col>
            <Col>
              <div>End Date</div>
              <DatePicker
                placeholderText="Select an End Date"
                selected={dateState.endDate}
                onChange={date => setDateState(prevState => ({ ...prevState, endDate: date }))}
                minDate={dateState.startDate}
                maxDate={new Date()}
                dateFormat="yyyy-MM-dd"
              />
            </Col>
          </Row>
        </Col>
      )}
      {showDateGroup && (
        <Col style={{ maxWidth: '200px', minWidth: '200px' }}>
          <div>Group By</div>
          <Select
            value={dateState.dateGroup || DEFAULT_GROUP_OPTION}
            onChange={option => setDateState(prevState => ({ ...prevState, dateGroup: option }))}
            options={groupOptions}
          />
        </Col>
      )}
    </Row>
  )
}

export default React.memo(DateRange)
