import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Map, TileLayer, CircleMarker, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import HeatmapLayer from 'react-leaflet-heatmap-layer'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import Filter from '../Widgets/Filter'
import { useLink } from '../../hooks/useHtml'
import { timestampToISOString } from '../../utilities/helpers'


const FLOOR_ERROR_OPTIONS = [
  'No Error',
  '= 1 Floor',
  '> 1 Floor'
]

const getColor = (difference) => {
  switch (true) {
    case Math.abs(difference) > 1:
      return '#DE071C'
    case Math.abs(difference) === 1:
      return '#FFCC00'
    default:
      return '#007D1B'
  }
}

const getSize = (difference) => {
  switch (true) {
    case Math.abs(difference) > 1:
      return 2.4
    default:
      return 2
  }
}

const getIntensity = (difference) => {
  switch (true) {
    case Math.abs(difference) > 1:
      return 1
    case Math.abs(difference) === 1:
      return 0.8
    default:
      return 0.5
  }
}

const getZIndex = (difference) => {
  switch (true) {
    case Math.abs(difference) > 1:
      return 99999
    case Math.abs(difference) === 1:
      return 999
    default:
      return 10
  }
}

const getIcon = (difference) => {
  const size = getSize(difference)
  const markerHtmlStyles = `
    background-color: ${getColor(difference)};
    width: ${size}rem;
    height: ${size}rem;
    display: block;
    left: -${size / 2}rem;
    top: -${size / 2}rem;
    position: relative;
    border-radius: 3rem 3rem 0;
    transform: rotate(45deg);
    border: 1px solid #FFFFFF;`

  return L.divIcon({
    iconAnchor: [0, 24],
    labelAnchor: [-6, 0],
    popupAnchor: [0, -36],
    html: `<span style="${markerHtmlStyles}" />`
  })
}

const showDifference = (difference, errorTypes) => {
  let isValid = false
  errorTypes.forEach((errorType) => {
    if (errorType === 'No Error' && difference === 0) {
      isValid = true
    }
    if (errorType === '= 1 Floor' && Math.abs(difference) === 1) {
      isValid = true
    }
    if (errorType === '> 1 Floor' && Math.abs(difference) > 1) {
      isValid = true
    }
  })
  return isValid
}

const HeatMap = ({ allData, dateState }) => {
  const { startDate, endDate } = dateState
  const [positions, setPositions] = useState([])
  const [filters, setFilters] = useState({
    errorTypes: FLOOR_ERROR_OPTIONS
  })
  const [loading1] = useLink('https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.0/leaflet.css')  
  const [loading2] = useLink('https://unpkg.com/leaflet@1.6.0/dist/leaflet.css')
  const loading = loading1 && loading2

  useEffect(() => {
    if (Array.isArray(allData) && allData.length > 0) {
      const newPositions = allData
        .filter((zaxis) => {
          const difference = zaxis.actual_floor - zaxis.expected_floor
          const zaxisDate = new Date(timestampToISOString(zaxis.timestamp))
          return (
            (!startDate || zaxisDate.getTime() >= startDate.getTime())
            && (!endDate || zaxisDate.getTime() <= endDate.getTime())
            && (showDifference(difference, filters.errorTypes))
          )
        })
        .map((zaxis) => {
          const difference = zaxis.actual_floor - zaxis.expected_floor
          return {
            id: zaxis.radar_id,
            time: zaxis.timestamp.split(' ')[0],
            altitude: Number(zaxis.altitude),
            v_uncertanity: Number(zaxis.vertical_uncertainty),
            difference,
            detectedFloor: zaxis.detected_floor === null ? zaxis.actual_floor : zaxis.detected_floor,
            expectedFloor: zaxis.detected_floor === null ? zaxis.expected_floor : zaxis.detected_floor, 
            intensity: getIntensity(difference),
            coordinates: [zaxis.lat, zaxis.lng]
          }
        })
      setPositions(newPositions)
    }
  }, [allData, startDate, endDate, filters])

  return (
    <>
      <Row className='justify-content-center'>
        <Col className="zaxis-filter">
          <Filter
            title="Filter by Floor Error"
            type="errorTypes"
            items={FLOOR_ERROR_OPTIONS}
            filters={filters}
            setFilters={setFilters}
          />
        </Col>
      </Row>
      <Row className='justify-content-center'>
        {!loading && (
          <Map
            center={[37.3230, 122.0322]}
            zoom={9}
            maxZoom={20}
            scrollWheelZoom
            dragging
            style={{ width: '600px', height: '450px' }}
          >
            <HeatmapLayer
              fitBoundsOnLoad
              fitBoundsOnUpdate
              minOpacity={0.3}
              points={positions}
              longitudeExtractor={p => p.coordinates[1]}
              latitudeExtractor={p => p.coordinates[0]}
              intensityExtractor={p => p.intensity}
            />
            <TileLayer
              url="https://raster-standard.geo.apple.com/tile?style=0&z={z}&x={x}&y={y}"
            />
            {positions
              .map(position => (
                <Marker
                  zIndexOffset={getZIndex(position.difference)}
                  key={position.id}
                  icon={getIcon(position.difference)}
                  position={position.coordinates}
                >
                  <Popup>
                    <div>{`Test Date: ${position.time}`}</div>
                    <div>{`Floor Error: ${position.difference}`}</div>
                    <div>{`Detected Floor: ${position.detectedFloor}`}</div>
                    <div>{`Expected Floor: ${position.expectedFloor}`}</div>
                    <div>{`Altitude: ${position.altitude}`}</div>
                    <div>{`Uncertainty: ${position.v_uncertanity}`}</div>
                    <a href={`rdar://${position.id}`}>{`rdar://${position.id}`}</a>
                  </Popup>
                </Marker>
              ))}
          </Map>
        )}
      </Row>
    </>
  )
}

export default React.memo(HeatMap)
