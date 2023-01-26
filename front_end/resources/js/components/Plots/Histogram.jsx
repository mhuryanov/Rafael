import React, { useState, useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Legend, Label
} from 'recharts'
import { Count } from '@dx/continuum-count'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import TableModal from '../Widgets/TableModal'
import { useFetchRafael } from '../../hooks/fetchData'
import { ZAXIS_API } from '../../utilities/constants'
import { addToObject, timestampToISOString } from '../../utilities/helpers'

const _  = require('underscore')
const shortid = require('shortid')

const addToBin = (binnedOutcomes, zaxisData, bin) => {
  if (bin in binnedOutcomes) {
    addToObject(binnedOutcomes[bin], 'entries', zaxisData)
  } else {
    binnedOutcomes[bin] = {
      entries: [zaxisData]
    }
  }
}

const binOutcomes = (allData, technology, startDate, endDate) => {
  const binnedOutcomes = {}
  let maxDifference = 0
  let minDifference = 0
  if (allData) {
    allData.forEach((zaxis) => {
      const zaxisDate = new Date(timestampToISOString(zaxis.timestamp))
      if ((!startDate || zaxisDate.getTime() >= startDate.getTime()) && (!endDate || zaxisDate.getTime() <= endDate.getTime())) {
        if (zaxis.detected_floor !== null) {
          addToBin(binnedOutcomes, zaxis, 0, false)
        } else {
          const difference = zaxis.actual_floor - zaxis.expected_floor
          maxDifference = Math.max(maxDifference, difference)
          minDifference = Math.min(minDifference, difference)
          addToBin(binnedOutcomes, zaxis, difference)
        }
      }
    })
  }
  _.range(maxDifference + 1).forEach((num) => {
    if (!(num in binnedOutcomes)) {
      binnedOutcomes[num] = {
        entries: []
      }
    }
  })
  _.range(-minDifference + 1).forEach((num) => {
    if (!(-num in binnedOutcomes)) {
      binnedOutcomes[-num] = {
        entries: []
      }
    }
  })
  return binnedOutcomes
}


const Histogram = ({ allData, technology, dateState }) => {
  const { startDate, endDate } = dateState
  const [dataToPlot, setDataToPlot] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalData, setModalData] = useState({})
  const totalRadars = dataToPlot.reduce((acc, entry) => acc + entry.total, 0)

  useEffect(() => {
    if (Array.isArray(allData) && allData.length > 0) {
      const binnedOutcomes = binOutcomes(allData, technology, startDate, endDate)
      const newDataToPlot = Object.keys(binnedOutcomes)
        .sort((a, b) => a - b)
        .map(bin => ({
          name: bin,
          total: binnedOutcomes[bin].entries.length,
          entries: binnedOutcomes[bin].entries
        }))
      setDataToPlot(newDataToPlot)
    }
  }, [allData, technology, startDate, endDate])

  const handleClick = (payload) => {
    if (payload && payload.payload) {
      setIsModalOpen(true)
      setModalData(payload.payload)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  console.log('Rendering Histogram')
  return (
    <>
      <div>
        <Count variant="info">{`${totalRadars} Radars`}</Count>
      </div>
      <Row className='justify-content-center'>
        <BarChart
          width={600}
          height={475}
          data={dataToPlot}
          barCategoryGap={0}
          margin={{
            top: 20, left: 20, bottom: 25
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name">
            <Label value="Error (# of floors)" offset={5} position="bottom" />
          </XAxis>
          <YAxis>
            <Label value="# of Radars" position="left" angle={-90} />
          </YAxis>
          <Bar 
            dataKey="total" 
            stackId="a" 
            fill="lightblue" 
            label={{ position: 'top' }} 
            onClick={handleClick} 
            style={{ cursor: 'pointer' }} 
          />
        </BarChart>
      </Row>
      <TableModal isOpen={isModalOpen} handleClose={handleModalClose} data={modalData} />
    </>
  )
}

export default React.memo(Histogram)
