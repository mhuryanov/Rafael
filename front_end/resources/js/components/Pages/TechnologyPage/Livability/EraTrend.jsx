/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect, useContext } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { Button } from '@dx/continuum-button'
import { Modal, ModalContent, ModalHeader } from '@dx/continuum-modal'
import { Checkbox } from '@dx/continuum-checkbox'

import { useQuery, encodeQueryParam, decodeQueryParam, dateToString } from '../../../../utilities/helpers'
import { LIVABILITY_API } from '../../../../utilities/constants'
import { useFetchRafael } from '../../../../hooks/fetchData'
import { useHistory, useLocation } from 'react-router-dom'
import FavoriteIcon from '../../../Widgets/FavoriteIcon'
import Box from '../../../Box'
import ResultsTable from '../../../Tables/ResultsTable'

const StackedBarChart = lazy(() => import('../../../Plots/StackedBarChart'))
const PlotSelection = lazy(() => import('./PlotSelection'))

const _ = require('underscore')

const FILTER_OPTIONS = [
  'Pass',
  'No user feedback',
  'Empty logstitch result',
  'Feedback Only - Decision Correct',
  'Feedback Only - Decision Incorrect',
  'Fail'
]

const EraModal = ({ isOpen, handleClose, columnNames }) => {
  return (
    <div className="plot-selection-modal">
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalHeader>Plot Selection</ModalHeader>
        <ModalContent>
          <Suspense fallback={<Spinner visible={true} />}>
            {isOpen && <PlotSelection columnNames={columnNames} plots={['Bar']} types={['ERA']} callBack={handleClose} />}
          </Suspense>
        </ModalContent>
      </Modal>
    </div>
  )
}

const Plot = ({ allData, technology, dateState, plot, errorType, columnName }) => {
  switch (plot) {
    case 'Bar':
      return (
        <Suspense fallback={<Spinner visible={true} />}>
          <StackedBarChart
            allData={allData}
            technology={technology}
            dateState={dateState}
            errorType={errorType}
            columnName={columnName}
          />
        </Suspense>
      )
    default:
      return null
  }
}

export const buildQueryString = ({
  startDate = null,
  endDate = null,
}) => {
  let queryString = ''
  if (startDate) {
    queryString += `${queryString === '' ? '' : 'AND '}(livability_erasession.startTimestamp BETWEEN '${dateToString(startDate)}' AND '${dateToString(endDate || new Date())}') OR (livability_erasession.timestamp BETWEEN '${dateToString(startDate)}' AND '${dateToString(endDate || new Date())}')`
  }
  return queryString
}


export const getArchiveFilterParams = (queryString, url) => ({
  url,
  data: {
    query_string: queryString,
  },
  method: 'GET'
})

const EraTrend = ({
  technology,
  feature,
  dateState
}) => {
  const location = useLocation()
  const history = useHistory()
  const query = useQuery()
  const { pathname } = location
  const customPlots = decodeQueryParam('plots', query)
  const customColumnNames = decodeQueryParam('cols', query)
  const customTypes = decodeQueryParam('types', query)
  const { startDate, endDate } = dateState

  const [queryString, setQueryString] = useState(buildQueryString({
    startDate,
    endDate,
  }))

  const [isLoading, eraData] = useFetchRafael({ url: `${LIVABILITY_API}feature/${feature}/?query_string=${queryString}`}, [])
  //const [isLoading, eraData] = useFetchRafael({ url: `${LIVABILITY_API}feature/${feature}/` }, [])
  const [allData, setAllData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [filters, setFilters] = useState(FILTER_OPTIONS)
  const [columnNames, setColumnNames] = useState([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setAllData(eraData
        .filter(era => era.eraquerymade === null || era.eraquerymade)
        .map(era => ({
          ...era, timestamp: era.timestamp ? era.timestamp.split('T').join(' ') : era.startTimestamp.split('T').join(' '),
          feedbackOnly: era.startTimestamp ? false : true,
          result: era.result || (era.failreason ? 'Expected Fail' : ''),
          mecard: era.mecard ? true : false,
          failreason: era.failreason || ((era.decision === 'incorrect') ? 'FeedbackIncorrct' : '') || 'none',
          erasource: era.erasource || 'Empty'
        })))
      setColumnNames(Object.keys(eraData[0]))
    }
  }, [isLoading, eraData])

  useEffect(() => {
    let newFilteredData = allData
    if (!filters.includes('Pass')) {
      newFilteredData = newFilteredData.filter(era => (
        !(!era.feedbackOnly && era.decision === 'correct' && era.result && era.result !== 'fail')
      ))
    }
    if (!filters.includes('No user feedback')) {
      newFilteredData = newFilteredData.filter(era => (
        era.feedbackOnly || era.decision
      ))
    }
    if (!filters.includes('Empty logstitch result')) {
      newFilteredData = newFilteredData.filter(era => (
        era.feedbackOnly || era.result || !era.decision
      ))
    }
    if (!filters.includes('Fail')) {
      newFilteredData = newFilteredData.filter(era => (
        era.feedbackOnly || era.decision !== 'incorrect' && era.result !== 'fail'
      ))
    }
    if (!filters.includes('Feedback Only - Decision Correct')) {
      newFilteredData = newFilteredData.filter(era => (
        !era.feedbackOnly || !era.decision || era.decision !== 'correct'
      ))
    }
    if (!filters.includes('Feedback Only - Decision Incorrect')) {
      newFilteredData = newFilteredData.filter(era => (
        !era.feedbackOnly || !era.decision || era.decision !== 'incorrect'
      ))
    }
    setFilteredData(newFilteredData)
  }, [allData, filters])

  const handleClick = () => {
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
  }

  const handleDelete = (plot, colName, type) => {
    customPlots.forEach((cPlot, i) => {
      const cColName = customColumnNames[i]
      const cType = customTypes[i]
      if (plot === cPlot && colName === cColName && type === cType) {
        customPlots.splice(i, 1)
        customColumnNames.splice(i, 1)
        customTypes.splice(i, 1)
      }
    })
    const plotsStr = encodeQueryParam(customPlots)
    const colsStr = encodeQueryParam(customColumnNames)
    const typesStr = encodeQueryParam(customTypes)
    history.push(
      `${pathname}?plots=${plotsStr}&cols=${colsStr}&types=${typesStr}`
    )
  }

  const handleCheck = (filter) => {
    if (filters.includes(filter)) {
      setFilters(prevFilters => _.without(filters, filter))
    } else {
      setFilters(prevFilters => prevFilters.concat(filter))
    }
  }

  console.log('Rendering EraTrend')
  return (
    <>
      <Row>
        {FILTER_OPTIONS.map(option => (
          <span style={{ marginRight: '15px', marginLeft: '15px' }}>
            <Checkbox key={option} checked={filters.includes(option)} onChecked={() => handleCheck(option)}>
              {option}
            </Checkbox>
          </span>
        ))}
      </Row>
      <Row className="justify-content-end">
        <Col sm="1" style={{ minWidth: '125px' }}>
          {columnNames && <Button variant="primary" onClick={handleClick}>Add New Plot</Button>}
        </Col>
        <Col sm="1" style={{ minWidth: '100px' }}>
          <FavoriteIcon />
        </Col>
        <EraModal isOpen={showModal} handleClose={handleModalClose} columnNames={columnNames} />
      </Row>
      <Row>
        <Col className="box technology-trend">
          <div className="trend-plot-container">
            <h1 className="plot-title">{`ERA Pass/Fail Trends`}</h1>
            <Suspense fallback={<Spinner visible={true} />}>
              <StackedBarChart feature={feature} allData={filteredData} technology={technology} dateState={dateState} errorType={feature} />
            </Suspense>
            <Spinner visible={isLoading} />
          </div>
        </Col>
        <Col className="box technology-trend">
          <div className="trend-plot-container">
            <h1 className="plot-title">{`ERA Fail Reason`}</h1>
            <Suspense fallback={<Spinner visible={true} />}>
              <StackedBarChart feature={feature} allData={filteredData} technology={technology} dateState={dateState} errorType={feature} columnName="failreason" />
            </Suspense>
            <Spinner visible={isLoading} />
          </div>
        </Col>
        <Col className="box technology-trend">
          <div className="trend-plot-container">
            <h1 className="plot-title">{`ERA Me Card`}</h1>
            <Suspense fallback={<Spinner visible={true} />}>
              <StackedBarChart feature={feature} allData={filteredData} technology={technology} dateState={dateState} errorType={feature} columnName="mecard" />
            </Suspense>
            <Spinner visible={isLoading} />
          </div>
        </Col>
        <Col className="box technology-trend">
          <div className="trend-plot-container">
            <h1 className="plot-title">{`ERA Source`}</h1>
            <Suspense fallback={<Spinner visible={true} />}>
              <StackedBarChart feature={feature} allData={filteredData} technology={technology} dateState={dateState} errorType={feature} columnName="erasource" />
            </Suspense>
            <Spinner visible={isLoading} />
          </div>
        </Col> 
        {customPlots.map((plot, i) => {
          const colName = customColumnNames[i]
          const type = customTypes[i]
          return (
            <Col key={plot + colName + type} className="box technology-trend">
              <div className="trend-plot-container">
                <h1 className="plot-title">
                  {`${type} Error vs ${colName}`}
                  <span style={{ float: 'right' }}>
                    <Button variant="danger" onClick={() => handleDelete(plot, colName, type)}>Delete</Button>
                  </span>
                </h1>
                <Plot
                  allData={filteredData}
                  technology={technology}
                  dateState={dateState}
                  plot={plot}
                  errorType={type}
                  columnName={colName}
                />
                <Spinner visible={isLoading} />
              </div>
          </Col>
          )
        })}
      </Row>
    </>
  )
}

export default React.memo(EraTrend)
