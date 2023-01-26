/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { Button } from '@dx/continuum-button'
import { SelectDropdown } from '@dx/continuum-select-dropdown'

import { useQuery, encodeQueryParam, decodeQueryParam } from '../../../../utilities/helpers'
import { useHistory, useLocation } from 'react-router-dom'


const PlotSelection = ({
  columnNames,
  plots,
  types,
  callBack
}) => {
  const location = useLocation()
  const history = useHistory()
  const query = useQuery()
  const { pathname } = location
  const customPlots = decodeQueryParam('plots', query)
  const customColumnNames = decodeQueryParam('cols', query)
  const customTypes = decodeQueryParam('types', query)
  const [selectedPlot, setSelectedPlot] = useState()
  const [selectedCol, setSelectedCol] = useState()
  const [selectedType, setSelectedType] = useState()

  const handleSubmit = () => {
    customPlots.forEach((cPlot, i) => {
      const cColName = customColumnNames[i]
      const cType = customTypes[i]
      if (selectedPlot === cPlot && selectedCol === cColName && selectedType === cType) {
        return
      }
    })
    customPlots.push(selectedPlot)
    customColumnNames.push(selectedCol)
    customTypes.push(selectedType)
    const plotsStr = encodeQueryParam(customPlots)
    const colsStr = encodeQueryParam(customColumnNames)
    const typesStr = encodeQueryParam(customTypes)
    history.push(
      `${pathname}?plots=${plotsStr}&cols=${colsStr}&types=${typesStr}`
    )
    callBack()
  }

  console.log('Rendering PlotSelection')
  return (
    <>
      <Row className="justify-content-center plot-selection">
        <SelectDropdown
          value={selectedPlot && {
            value: selectedPlot,
            label: selectedPlot
          }}
          placeholder="Select Plot"
          onChange={(option) => {
            const { value } = option
            setSelectedPlot(value)
          }}
          options={plots.map(plot => ({ value: plot, label: plot }))}
        />
      </Row>
      <Row className="justify-content-center plot-selection">
        <SelectDropdown
          value={selectedCol && {
            value: selectedCol,
            label: selectedCol
          }}
          disabled={!selectedPlot}
          placeholder="Select X-Axis"
          onChange={(option) => {
            const { value } = option
            setSelectedCol(value)
          }}
          options={columnNames.map(col => ({ value: col, label: col }))}
        />
      </Row>
      <Row className="justify-content-center plot-selection">
        <SelectDropdown
          value={selectedType && {
            value: selectedType,
            label: selectedType
          }}
          disabled={!selectedCol}
          placeholder="Select Y-Axis"
          onChange={(option) => {
            const { value } = option
            setSelectedType(value)
          }}
          options={types.map(type => ({ value: type, label: type }))}
        />
      </Row>
      <Row className="justify-content-center plot-selection">
        <Button
          variant="confirm"
          onClick={handleSubmit}
          disabled={!selectedPlot || !selectedCol || !selectedType}
        >Submit</Button>
      </Row>
    </>
  )
}

// PlotSelection.propTypes = {
//   archives: PropTypes.array.isRequired
// }

export default React.memo(PlotSelection)
