import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  PieChart, Pie, Sector, Cell
} from 'recharts'
import { Count } from '@dx/continuum-count'
import { EmptyStatePanel } from '@dx/continuum-state-panel'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import {
  Modal,
  ModalHeader,
  ModalContent
} from '@dx/continuum-modal'

import ResultsTable from '../Tables/ResultsTable'
import {
  addToObject,
  getPipelineCategory,
  getDateRangeLabel,
  buildQueryString,
  getCategoryColor,
  getArchiveFilterParams
} from '../../utilities/helpers'
import { useFetchRafael } from '../../hooks/fetchData'

const shortid = require('shortid')

const getPipelineStates = (archives) => {
  const pipelineStates = {}
  Object.keys(archives).forEach((archiveId) => {
    const [archive] = archives[archiveId]
    addToObject(pipelineStates, archive.pipelinestate, [archive])
  })
  Object.keys(pipelineStates).forEach((pipelineState) => {
    pipelineStates[pipelineState].sort((archiveA, archiveB) => (
      archiveA.test_date < archiveB.test_date
    ))
  })
  return pipelineStates
}

const getFormattedData = (data) => {
  const formattedData = {}
  Object.keys(data)
    .forEach((pipelineState) => {
      addToObject(formattedData, getPipelineCategory(pipelineState), data[pipelineState])
    })
  return formattedData
}

const getPieChartData = (formattedData) => {
  return Object.keys(formattedData)
    .map(key => ({
      name: key,
      value: formattedData[key].length
    }))
    .sort((a, b) => b.name > a.name)
}


const PipelineModal = ({ isOpen, handleClose, setModalState, data }) => {

  return (
    <div className="pipeline-modal">
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalHeader>Archives</ModalHeader>
        <ModalContent>
          {isOpen && <ResultsTable results={data} type="ARCHIVE" setResultsState={setModalState} />}
        </ModalContent>
      </Modal>
    </div>
  )
}


const ArchivePieChart = ({ technology, feature, testNames, testIds, testDates, operator, fieldtest, dateState }) => {
  const { dateRange, startDate, endDate } = dateState
  const [activeIndex, setActiveIndex] = useState(0)
  const [modalState, setModalState] = useState({
    show: false,
    data: [],
    isReprocessing: false
  })
  const [savedHash, setSavedHash] = useState(shortid.generate())
  const [dateRangeLabel, setDateRangeLabel] = useState(getDateRangeLabel(dateRange, startDate, endDate))
  const [pieChartState, setPieChartState] = useState({
    archives: [],
    formattedData: {},
    pieChartData: [],
    total: 0
  })
  let queryString = buildQueryString({
    technology,
    feature,
    fieldTestId: fieldtest,
    startDate,
    endDate,
    testNames,
    testIds,
    testDates,
    operator,
  })
  const [isLoading, fetchedArchives] = useFetchRafael(getArchiveFilterParams(queryString), [savedHash])
  const {
    archives,
    formattedData,
    pieChartData,
    total
  } = pieChartState


  useEffect(() => {
    if (!isLoading && !fetchedArchives.message) {
      const newPipelineStates = getPipelineStates(fetchedArchives)
      const newFormattedData = getFormattedData(newPipelineStates)
      const newPieChartData = getPieChartData(newFormattedData)
      const newTotal = newPieChartData.reduce((acc, entry) => acc + entry.value, 0)
      setPieChartState(prevState => ({
        ...prevState,
        archives: fetchedArchives,
        total: newTotal,
        formattedData: newFormattedData,
        pieChartData: newPieChartData
      }))
    }
  }, [isLoading, fetchedArchives])

  useEffect(() => {
    setDateRangeLabel(getDateRangeLabel(dateRange, startDate, endDate))
  }, [dateRange, startDate, endDate])

  const handleModalOpen = (category) => {
    setModalState({
      show: true,
      data: formattedData[category],
      isReprocessing: false
    })
  }
  
  const handleModalClose = () => {
    const { isReprocessing } = modalState
    if (isReprocessing) {
      setSavedHash(shortid.generate())
    }
    setModalState({
      show: false,
      data: [],
      isReprocessing: false
    })
  }

  const renderActiveShape = ({
    cx, 
    cy, 
    midAngle, 
    innerRadius, 
    outerRadius, 
    startAngle, 
    endAngle,
    fill, 
    percent, 
    value, 
    name 
  }) => {
    const RADIAN = Math.PI / 180
    const sinMid = -Math.sin(RADIAN * midAngle)
    const cosMid = Math.cos(RADIAN * midAngle)
    const xSign = cosMid >= 0 ? 1 : -1
    const xStart = cx + (outerRadius + 8) * cosMid
    const yStart = cy + (outerRadius + 8) * sinMid
    const xMid = cx + (outerRadius + 25) * cosMid
    const yMid = cy + (outerRadius + 25) * sinMid
    const xEnd = xMid + xSign * 20
    const yEnd = yMid
    const textAnchor = cosMid >= 0 ? 'start' : 'end'
  
    return (
      <g style={{ wordWrap: 'break-word' }}>
        <text
          x={cx}
          y={cy - 10}
          dy={8}
          textAnchor="middle"
          fill={fill}
          style={{ fontSize: '60px', fontWeight: 'bolder' }}
        >
          {value}
        </text>
        <text
          x={cx}
          y={cy + 10}
          dy={8}
          width={150}
          textAnchor="middle"
          fill={fill}
          style={{ fontSize: '15px' }}
        >
          {name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 5}
          outerRadius={outerRadius + 8}
          fill={fill}
        />
        <path 
          d={`M${xStart},${yStart}L${xMid},${yMid}L${xEnd},${yEnd}`}
          stroke={fill}
          fill="none"
        />
        <circle 
          cx={xEnd}
          cy={yEnd}
          r={3}
          fill={fill}
          stroke="none"
        />
        <text
          fontSize="small"
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
          x={xEnd + xSign * 12}
          y={yEnd}
          textAnchor={textAnchor}
          fill="blue"
          onClick={() => handleModalOpen(name)}
        >
          {`Show Details`}
        </text>
        <text
          fontSize="small"
          x={xEnd + xSign * 12}
          y={yEnd}
          dy={18}
          textAnchor={textAnchor}
          fill="gray"
        >
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    )
  }

  console.log('Rendering ArchivePieChart')
  return (
    <>
      <div style={{ marginTop: '5px' }}>
        <Count variant="primary">{`Time Range: ${dateRangeLabel}`}</Count>
      </div>
      <div>
        <Count variant="info">{`${total} Archives`}</Count>
      </div>
      {pieChartData.length > 0 ? (
        <PieChart width={600} height={400}>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={pieChartData}
            dataKey="value"
            cx={280}
            cy={200}
            innerRadius={'60%'}
            outerRadius={'75%'}
            onMouseEnter={(data, index) => setActiveIndex(index)}
          >
            {
              pieChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`} 
                  fill={getCategoryColor(entry.name)}
                />
              ))
            }
          </Pie>
        </PieChart>
      ) : (
        <div style={{ padding: '100px' }}>
          <EmptyStatePanel />
        </div>
      )
    }
      <PipelineModal isOpen={modalState.show} handleClose={handleModalClose} setModalState={setModalState} data={modalState.data} />
      <Spinner visible={isLoading} />
    </>
  )
}

export default React.memo(ArchivePieChart)
