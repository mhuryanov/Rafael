import React, { useState, useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart, Label, LabelList
} from 'recharts'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import TableModal from '../Widgets/TableModal'
import { dateToString, differenceInDays, getPreviousDate, getFutureDate, addLeadingZeroes, timestampToISOString, addToObject } from '../../utilities/helpers'
import { MONTH_IN_DAYS, WEEK_IN_DAYS, DAY_IN_DAYS, CTP } from '../../utilities/constants'

const MONTH_CUTOFF = 90
const WEEK_CUTOFF = 14

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const columnMapping = {
  ZAXIS: {
    'radar_id': 'NUMBER',
    'timestamp': 'TIME',
    'decision': 'NUMBER',
    'building_height': 'NUMBER',
    'location_type': 'NUMBER',
    'horizontal_uncertainty': 'NUMBER',
    'vertical_uncertainty': 'NUMBER',
    'relative_altitude': 'NUMBER',
    'road_class': 'NUMBER',
    'lat': 'NUMBER',
    'lng': 'NUMBER',
    'pressure': 'NUMBER',
    'altitude': 'NUMBER',
    'form_of_way': 'NUMBER',
    'dem_uncertainty': 'NUMBER',
    'dem': 'NUMBER',
    'match_quality': 'NUMBER',
    'preferred_name': 'STRING',
    'detected_floor': 'NUMBER',
    'detected_location': 'STRING',
    'actual_location': 'STRING',
    'actual_floor': 'NUMBER',
    'expected_location': 'STRING',
    'expected_floor': 'NUMBER',
    'is_address_discrepancy': 'BOOLEAN',
    'is_floor_discrepancy': 'BOOLEAN',
    'build_version': 'STRING',
    'client_version': 'STRING',
    'zaxisResult': 'STRING',
    'baro_alt_used': 'BOOLEAN',
    'wifi_slam_used': 'BOOLEAN',
    'wifi_slam_available': 'BOOLEAN',
    'dem_based_alt_available': 'BOOLEAN',
    'ref_based_alt_available': 'BOOLEAN',
  },
  ERA: {
    id: 'NUMBER',
    radar_id: 'NUMBER',
    client_version: 'STRING',
    decision: 'STRING',
    civic_address: 'STRING',
    eradist: 'NUMBER',
    erasource: 'STRING',
    failreason: 'STRING',
    mecard: 'BOOLEAN',
    name: 'STRING',
    result: 'STRING',
    startTimestamp: 'TIME',
    timestamp: 'TIME',
    window: 'NUMBER',
    eraquerymade: 'BOOLEAN',
  }
}

const subtractMonth = (yearMonth) => {
  let [year, month] = yearMonth.split('-')
  year = Number(year)
  month = Number(month)
  let newMonth = month - 1
  let newYear = year
  if (newMonth <= 0) {
    newYear -= 1
    newMonth = 12
  }
  return `${newYear}-${addLeadingZeroes(newMonth)}`
}

const getYearMonthFromDate = (date) => {
  return dateToString(date).split('-').slice(0, 2).join('-')
}

const getAxisLabel = (startDate, endDate, dateGroup, dataType, columnName) => {
  if (dataType === 'TIME') {
    const timeRange = differenceInDays(startDate, endDate)
    switch (true) {
      case dateGroup && dateGroup.value !== null:
        return dateGroup.label
      case timeRange === null || timeRange > MONTH_CUTOFF:
        return 'Month'
      case timeRange > WEEK_CUTOFF:
        return 'Week'
      default:
        return 'Day'
    }
  }
  return columnName
}

const addOutcome = (allOutcomes, entry, label, errorType) => {
  let isError
  let isWarning
  let isIgnored = false
  const isFeedbackOnly = entry.feedbackOnly
  let isFeedbackCorrect = false
  let isFeedbackInCorrect = false
  if (!isFeedbackOnly) {
    const difference = Math.abs(entry.expected_floor - entry.actual_floor)
    switch (errorType) {
      case 'FLOOR':
        isError = difference > 1
        isWarning = difference === 1
        break
      case 'ADDRESS':
        isError = entry.is_address_discrepancy || false
        isWarning = false
        break
      case CTP:
        isError = !entry.pass
        isWarning = false
        break
      case 'ERA':
        isIgnored = !entry.decision
        isWarning = entry.decision && !entry.result
        isError = entry.result && entry.decision && (entry.decision === 'incorrect' || entry.result === 'fail')
        break
      default:
        break
    }
  } else {
    isFeedbackCorrect = entry.decision === "correct"
    isFeedbackInCorrect = entry.decision === "incorrect"
  }
  
  if (label in allOutcomes) {
    allOutcomes[label].success += !isFeedbackOnly && !isError && !isWarning && !isIgnored ? 1 : 0
    allOutcomes[label].error += isError ? 1 : 0
    allOutcomes[label].warning += isWarning || isFeedbackInCorrect ? 1 : 0
    allOutcomes[label].ignore += isIgnored ? 1 : 0
    allOutcomes[label].passwithissue += isFeedbackCorrect ? 1 : 0
  } else {
    allOutcomes[label] = {
      success: !isFeedbackOnly && !isError && !isWarning && !isIgnored ? 1 : 0,
      error: isError ? 1 : 0,
      warning: isWarning || isFeedbackInCorrect ? 1 : 0,
      ignore: isIgnored ? 1 : 0,
      passwithissue: isFeedbackCorrect ? 1 : 0,
    }
  }
  addToObject(allOutcomes[label], 'entries', [entry])
}

const binByMonth = (entryData, startDate, endDate, errorType) => {
  const allOutcomes = {}
  const startYearMonth = (
    (startDate instanceof Date)
      ? getYearMonthFromDate(startDate)
      : getYearMonthFromDate(new Date(timestampToISOString(entryData[entryData.length - 1].timestamp)))
  )
  const endYearMonth = (
    (endDate instanceof Date)
      ? getYearMonthFromDate(endDate)
      : getYearMonthFromDate(new Date())
  )
  let subYearMonth = endYearMonth
  let i = 0
  while (i < entryData.length && subYearMonth >= startYearMonth) {
    const dateLabel = subYearMonth
    const entry = entryData[i]
    const entryDate = new Date(timestampToISOString(entry.timestamp))
    if (getYearMonthFromDate(entryDate) === subYearMonth) {
      addOutcome(allOutcomes, entry, dateLabel, errorType)
      i += 1
    } else if (getYearMonthFromDate(entryDate) > subYearMonth) {
      i += 1
    } else {
      subYearMonth = subtractMonth(subYearMonth)
    }
  }
  return allOutcomes
}

const binByDate = (entryData, startDate, endDate, dateIncrement, errorType) => {
  if (dateIncrement >= MONTH_IN_DAYS) {
    return binByMonth(entryData, startDate, endDate, errorType)
  }
  const allOutcomes = {}
  const cutOffDate = startDate || new Date(timestampToISOString(entryData[entryData.length - 1].timestamp))
  let subEndDate = endDate || getFutureDate(differenceInDays(cutOffDate, endDate), cutOffDate)
  let subStartDate = getPreviousDate(dateIncrement, subEndDate)
  let i = 0
  while (i < entryData.length && subEndDate.getTime() > cutOffDate.getTime()) {
    const entry = entryData[i]
    const entryDate = new Date(timestampToISOString(entry.timestamp))
    const dateLabel = dateToString(subEndDate)
    if (entryDate.getTime() <= subEndDate.getTime() && entryDate.getTime() > subStartDate.getTime()) {
      addOutcome(allOutcomes, entry, dateLabel, errorType)
      i += 1
    } else if (entryDate.getTime() > subEndDate.getTime()) {
      i += 1
    } else {
      subEndDate = new Date(subStartDate.getTime())
      subStartDate = getPreviousDate(dateIncrement, subStartDate)
    }
  }
  return allOutcomes
}

const binByType = (entryData, errorType, dataType, columnName) => {
  const allOutcomes = {}
  entryData.forEach((entry) => {
    const label =
      dataType === 'NUMBER'
        ? Number(entry[columnName]).toFixed(0)
        : entry[columnName]
    addOutcome(allOutcomes, entry, label, errorType)
  })
  return allOutcomes
}

const getOutcomes = (allData, startDate, endDate, dateGroup, errorType, dataType, columnName) => {
  // sorted by most recent --> least recent
  if (dataType === 'TIME') {
    const sortedDataByDate = JSON.parse(JSON.stringify(allData)).sort((a, b) => (a.timestamp < b.timestamp) ? 1 : -1)
    const timeRange = differenceInDays(startDate, endDate)
    let dateIncrement
    switch (true) {
      case dateGroup.value !== null:
        dateIncrement = dateGroup.value
        break
      case timeRange === null || timeRange > MONTH_CUTOFF:
        dateIncrement = MONTH_IN_DAYS
        break
      case timeRange > WEEK_CUTOFF:
        dateIncrement = WEEK_IN_DAYS
        break
      default:
        dateIncrement = DAY_IN_DAYS
    }
    return binByDate(sortedDataByDate, startDate, endDate, dateIncrement, errorType)
  }
  const dataInDateRange = allData.filter((entry) => {
    const entryDate = new Date(timestampToISOString(entry.timestamp))
    return (!startDate || entryDate.getTime() >= startDate.getTime())
      && (!endDate || entryDate.getTime() <= endDate.getTime())
  })
  return binByType(dataInDateRange, errorType, dataType, columnName)
}

const renderTooltip = ({ active, payload }, errorType) => {
  if (active && Array.isArray(payload) && payload.length > 0) {
    const {
      numberOfError,
      numberOfWarning,
      numberOfSuccess,
      numberOfPasswithissue,
      numberOfIgnore,
      errorPercent,
      warningPercent,
      successPercent,
      passwithissuePercent,
      ignorePercent
    } = payload[0].payload
    return (
      <div className="custom-tooltip box">
        <div>
          {payload[0].payload.name}
        </div>
        {numberOfError > 0 && (
          <div>
            <strong className="tooltip-fail">
              {` ${numberOfError} (${errorPercent.toFixed(1)}%)`}
            </strong>
          </div>
        )}
        {numberOfWarning > 0 && (
          <div>
            <strong className={errorType === 'ERA' ? "tooltip-special" : "tooltip-warning"}>
              {` ${numberOfWarning} (${warningPercent.toFixed(1)}%)`}
            </strong>
          </div>
        )}
        {numberOfIgnore > 0 && (
          <div>
            <strong className="tooltip-ignore">
              {` ${numberOfIgnore} (${ignorePercent.toFixed(1)}%)`}
            </strong>
          </div>
        )}
        {numberOfPasswithissue > 0 && (
          <div>
            <strong className="tooltip-passwithissue">
              {` ${numberOfPasswithissue} (${passwithissuePercent.toFixed(1)}%)`}
            </strong>
          </div>
        )}
        {numberOfSuccess > 0 && (
          <div>
            <strong className="tooltip-success">
              {` ${numberOfSuccess} (${successPercent.toFixed(1)}%)`}
            </strong>
          </div>
        )}
      </div>
    )
  }
  return null
}

const getCTPLegendLabel = (value) => {
  switch (true) {
    case value.includes('success'):
      return 'Pass'
    case value.includes('error'):
      return 'Fail'
    case value.includes('ignore'):
      return 'Ignore'
    case value.includes('passwithissue'):
      return 'Pass w/ Issue'
    default:
      return ''
  }
}

const getLegendLabel = (value) => {
  switch (true) {
    case value.includes('success'):
      return 'Pass'
    case value.includes('warning'):
      return 'Empty logstitch result/Feedback Only Decision Incorrect'
    case value.includes('error'):
      return 'Fail'
    case value.includes('ignore'):
      return 'No user feedback'
    case value.includes('passwithissue'):
      return 'Feedback Only Decision Correct'
    default:
      return ''
  }
}

const getFloorLegendLabel = (value) => {
  switch (true) {
    case value.includes('success'):
      return 'No Error'
    case value.includes('error'):
      return ' > 1 Floor'
    default:
      return ' = 1 Floor'
  }
}

const renderLegend = (errorType, { payload }) => {
  switch (errorType) {
    case 'FLOOR':
      return (
        <Row className="justify-content-center legend-container">
          {payload
            .filter(entry => entry.value.includes('success') || entry.value.includes('error') || entry.value.includes('warning'))
            .map(entry => (
              <Col key={entry.value}>
                <span className="color-block legend-entry" style={{ backgroundColor: entry.color }} />
                <span>{getFloorLegendLabel(entry.value)}</span>
              </Col>
            ))
          }
        </Row>
      )
    case 'ADDRESS':
      return (
        <Row className="justify-content-center legend-container">
          {payload
            .filter(entry => entry.value.includes('success') || entry.value.includes('error'))
            .map(entry => (
              <div key={entry.value} style={{ marginRight: '50px' }}>
                <span className="color-block legend-entry" style={{ backgroundColor: entry.color }} />
                <span>{getLegendLabel(entry.value)}</span>
              </div>
            ))
          }
        </Row>
      )
      case CTP:
        return (
          <Row className="justify-content-center legend-container">
            {payload
              .filter(entry => entry.value.includes('success') || entry.value.includes('error'))
              .map(entry => (
                <div key={entry.value} style={{ marginRight: '50px' }}>
                  <span className="color-block legend-entry" style={{ backgroundColor: entry.color }} />
                  <span>{getCTPLegendLabel(entry.value)}</span>
                </div>
              ))
            }
          </Row>
        )
    default:
      return (
        <Row className="justify-content-center legend-container">
          {payload
            .map(entry => (
              <div key={entry.value} style={{ marginRight: '25px' }}>
                <span className="color-block legend-entry" style={{ backgroundColor: entry.color }} />
                <span>{getLegendLabel(entry.value)}</span>
              </div>
            ))
          }
        </Row>
      )
  }
}

const renderTotal = ({ x, y, width, value }) => {
  return (
    <text x={x + width / 2} y={y - 12} textAnchor="middle" dominantBaseline="middle" fontSize="smaller">
      {width > 60 && 'Total: '}
      {width > 10 && value}
    </text>
  )
}

const getName = (dataType, label, axisLabel) => {
  let name = ''
  switch (dataType) {
    case 'TIME':
      const [date, zone] = label.split(' ')
      const [year, month, day] = date.split('-').map(entry => Number(entry))
      if (axisLabel === 'Month') {
        name = `${MONTH_NAMES[month]} ${year}`
      } else {
        name = `${month}/${day}`
      }
      break
    default:
      name = label
      break
  }
  return name
}


const StackedBarChart = ({ feature = 'ZAXIS', allData, dateState, errorType, columnName = 'timestamp', width = 600, height = 500 }) => {
  const { startDate, endDate, dateGroup } = dateState
  const dataType = columnMapping[feature] ? columnMapping[feature][columnName] : 'STRING'
  const axisLabel = getAxisLabel(startDate, endDate, dateGroup, dataType, columnName)
  const [dataToPlot, setDataToPlot] = useState([])
  const [legend, setLegend] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalData, setModalData] = useState({})

  useEffect(() => {
    if (Array.isArray(allData) && allData.length > 0) {
      const allOutcomes = getOutcomes(allData, startDate, endDate, dateGroup, errorType, dataType, columnName)
      const newDataToPlot = Object.keys(allOutcomes)
        .sort((a, b) => {
          if (dataType === 'NUMBER') return (Number(a) > Number(b)) ? 1 : -1
          return (a > b) ? 1 : -1
        })
        .map((label) => {
          const name = getName(dataType, label, axisLabel)
          const outcome = allOutcomes[label]
          const { entries, ...rest } = outcome
          const total = Object.keys(rest).reduce((acc, key) => acc + outcome[key], 0)
          const dataEntry = {
            name, entries, total
          }
          Object.keys(rest).forEach((key) => {
            if (outcome[key] > 0) {
              dataEntry[`numberOf${key[0].toUpperCase() + key.slice(1)}`] = outcome[key]
              dataEntry[`${key}Percent`] = (outcome[key] / total) * 100
            }
          })
          return dataEntry
        })
      setDataToPlot(newDataToPlot)
    }
  }, [allData, startDate, endDate, dateGroup])

  useEffect(() => {
    if (dataToPlot) {
      setTimeout(() => {
        setLegend(
          <Legend
            content={props => renderLegend(errorType, props)}
            verticalAlign="top"
            height={35}
          />
        )
      }, 500)
    }

  }, [dataToPlot])

  const handleBarClick = (payload) => {
    if (payload && payload.payload) {
      setIsModalOpen(true)
      setModalData(payload.payload)
    }
  }

  console.log('Rendering StackedBarChart')
  return (
    <Row className='justify-content-center'>
      <ComposedChart
        width={width}
        height={height}
        data={dataToPlot}
        margin={{
          top: 20, left: 20, bottom: 25
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {legend}
        <XAxis dataKey="name">
          <Label value={axisLabel} offset={5} position="bottom" />
        </XAxis>
        <YAxis type="number" domain={[0, upperBound => (Number(upperBound.toFixed(0)))]}>
          <Label value="% Tests" position="left" angle={-90} />
        </YAxis>
        <Tooltip content={(props) => renderTooltip(props, errorType)} isAnimationActive={false} />
        <Bar barSize={80} dataKey="successPercent" stackId="a" fill="green" onClick={handleBarClick} style={{ cursor: 'pointer' }} />
        <Bar barSize={80} dataKey="passwithissuePercent" stackId="a" fill="lightgreen" onClick={handleBarClick} style={{ cursor: 'pointer' }} />
        <Bar barSize={80} dataKey="ignorePercent" stackId="a" fill="lightgray" onClick={handleBarClick} style={{ cursor: 'pointer' }} />
        <Bar barSize={80} dataKey="warningPercent" stackId="a" fill={errorType === 'ERA' ? 'plum' : "#FFFF99"} onClick={handleBarClick} style={{ cursor: 'pointer' }} />
        <Bar barSize={80} dataKey="errorPercent" stackId="a" fill="crimson" onClick={handleBarClick} style={{ cursor: 'pointer' }}>
          <LabelList content={renderTotal} dataKey="total" position="top" />
        </Bar>
      </ComposedChart>
      <TableModal isOpen={isModalOpen} handleClose={() => setIsModalOpen(false)} data={modalData} errorType={errorType} />
    </Row>
  )
}

export default React.memo(StackedBarChart)
