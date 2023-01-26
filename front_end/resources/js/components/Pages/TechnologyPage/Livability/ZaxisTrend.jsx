/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect, useContext } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { Button } from '@dx/continuum-button'
import { Modal, ModalContent, ModalHeader } from '@dx/continuum-modal'

import { useQuery, encodeQueryParam, decodeQueryParam, timestampToISOString } from '../../../../utilities/helpers'
import { ZAXIS_API } from '../../../../utilities/constants'
import { useFetchRafael } from '../../../../hooks/fetchData'
import { useHistory, useLocation } from 'react-router-dom'
import FavoriteIcon from '../../../Widgets/FavoriteIcon'
import Box from '../../../Box'
import ResultsTable from '../../../Tables/ResultsTable'

const StackedBarChart = lazy(() => import('../../../Plots/StackedBarChart'))
const Histogram = lazy(() => import('../../../Plots/Histogram'))
const HeatMap = lazy(() => import('../../../Plots/HeatMap'))
const PlotSelection = lazy(() => import('./PlotSelection'))

const shortid = require('shortid')

const ZaxisModal = ({ isOpen, handleClose, columnNames }) => {
  return (
    <div className="plot-selection-modal">
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalHeader>Plot Selection</ModalHeader>
        <ModalContent>
          <Suspense fallback={<Spinner visible={true} />}>
            {isOpen && <PlotSelection columnNames={columnNames} plots={['Bar']} types={['FLOOR', 'ADDRESS']} callBack={handleClose} />}
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

const ZaxisTrend = ({
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
  const [isLoading, zAxisData] = useFetchRafael({ url: ZAXIS_API }, [])
  const [allData, setAllData] = useState([])
  const [columnNames, setColumnNames] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [priorityRadars, setPriorityRadars] = useState([])
  const [noLogstitchRadars, setNoLogstitchRadars] = useState([])

  useEffect(() => {
    if (!isLoading) {
      setAllData(zAxisData)
      setColumnNames(Object.keys(zAxisData[0]))
    }
  }, [isLoading, zAxisData])

  useEffect(() => {
    const { startDate, endDate } = dateState
    const newPriorityRadars = allData.filter(radar => (
      Math.abs(radar.actual_floor - radar.expected_floor) >= 2
      && (radar.baro_alt_used || radar.wifi_slam_used || radar.wifi_slam_available || radar.ref_alt_available)
      && (!startDate || new Date(timestampToISOString(radar.timestamp)).getTime() >= startDate.getTime())
      && (!endDate || new Date(timestampToISOString(radar.timestamp)).getTime() <= endDate.getTime())
    ))
    const newNoLogstitchRadars = allData.filter(radar => (
      Math.abs(radar.actual_floor - radar.expected_floor) > 0
      && radar.baro_alt_used === null
      && (!startDate || new Date(timestampToISOString(radar.timestamp)).getTime() >= startDate.getTime())
      && (!endDate || new Date(timestampToISOString(radar.timestamp)).getTime() <= endDate.getTime())
    ))
    setPriorityRadars(newPriorityRadars)
    setNoLogstitchRadars(newNoLogstitchRadars)
  }, [allData, dateState])

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

  console.log('Rendering ZaxisTrend')
  return (
    <>
      <Row className="justify-content-end">
        <Col sm="1" style={{ minWidth: '125px' }}>
          {columnNames && <Button variant="primary" onClick={handleClick}>Add New Plot</Button>}
        </Col>
        <Col sm="1" style={{ minWidth: '100px' }}>
          <FavoriteIcon />
        </Col>
        <ZaxisModal isOpen={showModal} handleClose={handleModalClose} columnNames={columnNames} />
      </Row>
      <Row>
        <Box
          title="Z-Axis High Priority Radars"
          subTitle="Floor Error >= 2, Baro Alt Used || WiFi SLAM Used || WiFi SLAM Available || Ref Alt Available"
          type="summary-table"
          isLoading={isLoading}
        >
          <ResultsTable technology={technology} feature={feature} results={{ entries: priorityRadars }} type="ZAXIS" />
        </Box>
      </Row>
      <Row>
        <Col className="box technology-trend">
          <div className="trend-plot-container">
            <h1 className="plot-title">{`Z-Axis Floor Error Trends`}</h1>
            <Suspense fallback={<Spinner visible={true} />}>
              <StackedBarChart allData={allData} technology={technology} dateState={dateState} errorType="FLOOR" />
            </Suspense>
            <Spinner visible={isLoading} />
          </div>
        </Col>
        <Col className="box technology-trend">
          <div className="trend-plot-container">
            <h1 className="plot-title">Z-Axis Histogram</h1>
            <Suspense fallback={<Spinner visible={true} />}>
              <Histogram allData={allData} technology={technology} dateState={dateState} />
            </Suspense>
            <Spinner visible={isLoading} />
          </div>
        </Col>
        <Col className="box technology-trend">
          <div className="trend-plot-container">
            <h1 className="plot-title">{`Z-Axis Address Error Trends`}</h1>
            <Suspense fallback={<Spinner visible={true} />}>
              <StackedBarChart allData={allData} technology={technology} dateState={dateState} errorType="ADDRESS" />
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
                  {`Z-Axis ${type[0] + type.slice(1).toLowerCase()} Error vs ${colName}`}
                  <span style={{ float: 'right' }}>
                    <Button variant="danger" onClick={() => handleDelete(plot, colName, type)}>Delete</Button>
                  </span>
                </h1>
                <Plot
                  allData={allData}
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
        <Col className="box technology-trend">
          <div className="trend-plot-container">
            <h1 className="plot-title">{`Z-Axis Radar Heatmap`}</h1>
            <Suspense fallback={<Spinner visible={true} />}>
              <HeatMap allData={allData} technology={technology} dateState={dateState} />
            </Suspense>
            <Spinner visible={isLoading} />
          </div>
        </Col>
      </Row>
      <Row>
        <Box
          title="Z-Axis Missing Logstitch / No Timestamp Match"
          subTitle="Floor Error >= 1, No Logstitch Results"
          type="summary-table"
          isLoading={isLoading}
        >
          <ResultsTable technology={technology} feature={feature} results={{ entries: noLogstitchRadars }} type="ZAXIS" />
        </Box>
      </Row>
    </>
  )
}

export default React.memo(ZaxisTrend)
