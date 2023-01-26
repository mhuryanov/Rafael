import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Button } from '@dx/continuum-button'
import { SelectDropdown } from '@dx/continuum-select-dropdown'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { useFetchRafael } from '../../../../../hooks/fetchData'
import { KPI_MAPPING_API } from '../../../../../utilities/constants'
import { sendToServer, dateToString } from '../../../../../utilities/helpers'


const TimeRangeForm = ({ technology, feature, setTimeRange }) => {
  const [isLoading, fetchedKpi] = useFetchRafael({ url: `${KPI_MAPPING_API}${technology}/${feature}/TimeRanges` }, [])
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [timeRanges, setTimeRanges] = useState([])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [dateToAdd, setDateToAdd] = useState(null)
  const [isNewKpi, setIsNewKpi] = useState(true)
  const { errorMessage } = fetchedKpi
  const dateOptions = timeRanges.sort().map((dateString, i) => {
    if (i === timeRanges.length - 1) {
      return { label: `${dateString} to Present`, value: dateString } 
    }
    const nextDateString = timeRanges[i + 1]
    return {
      label: `${dateString} to ${nextDateString}`,
      value: dateString
    }
  }).reverse()

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const referenceKpi = fetchedKpi
      const referenceMeta = referenceKpi.meta
      const { timeRanges: newTimeRanges } = JSON.parse(JSON.stringify(referenceMeta))
      setTimeRanges(newTimeRanges.slice())
      setIsNewKpi(false)
    }
  }, [isLoading, errorMessage, fetchedKpi])

  const handleSelectTimeRange = (option) => {
    setTimeRange(option)
  }

  const handleSuccess = () => {
    setIsLoadingSave(false)
    setTimeRanges(prevTimeRanges => prevTimeRanges.concat(dateToString(dateToAdd).split(' ')[0]))
    if (isNewKpi) setIsNewKpi(false)
    setDateToAdd(null)
    setShowDatePicker(false)
  }

  const handleSave = () => {
    if (!dateToAdd) return
    const dateString = dateToString(dateToAdd).split(' ')[0]
    if (timeRanges.includes(dateString)) return
    if (confirm('Are you sure? This will be a permanent change.')) {
      setIsLoadingSave(true)
      if (isNewKpi) {
        const referenceKpi = {
          unique_name: 'TimeRanges',
          name: 'TimeRanges',
          category: 'TimeRanges',
          unit: '',
          criteria: {},
          date: '',
          meta: { timeRanges: [dateString] }
        }
        sendToServer(`${KPI_MAPPING_API}${technology}/${feature}`, referenceKpi, 'POST', handleSuccess)
      } else {
        sendToServer(
          `${KPI_MAPPING_API}${technology}/${feature}/TimeRanges/update_kpi`,
          { meta: { timeRanges: timeRanges.concat([dateString]) } },
          'PATCH',
          handleSuccess
        )
      }
    }
  }

  const handleCancel = () => {
    setDateToAdd(null)
    setShowDatePicker(false)
  }
  
  return (
    <div>
      <Row>
        <Col>
          <SelectDropdown
            placeholder="Select a time range..."
            defaultValue={dateOptions.length > 0 && dateOptions[0]}
            onChange={handleSelectTimeRange}
            options={dateOptions}
          />
        </Col>
        <Col>
          {!showDatePicker ? (
            <Button onClick={() => setShowDatePicker(true)}>
              Add new time range
            </Button>
          ) : (
            <>
              <Col style={{ fontSize: '12px' }}>
                <DatePicker
                  placeholderText="Select a start date"
                  selected={dateToAdd}
                  onChange={date => setDateToAdd(date)}
                  maxDate={new Date()}
                  dateFormat="yyyy-MM-dd"
                />
                <Row style={{ marginTop: '10px' }}>
                  <Col style={{ maxWidth: '60px' }}>
                    <Button onClick={handleSave} variant="confirm" size="small">Save</Button>
                  </Col>
                  <Col style={{ maxWidth: '60px' }}>
                    <Button onClick={handleCancel} size="small">Cancel</Button>
                  </Col>
                </Row>
              </Col>
              <Col>
                <div style={{ marginTop: '5px' }} className="sub-message-text">End date defaults to next nearest time range.</div>
              </Col>
            </>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default React.memo(TimeRangeForm)
