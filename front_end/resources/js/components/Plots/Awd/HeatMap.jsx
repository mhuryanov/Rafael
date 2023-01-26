import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Map, TileLayer, CircleMarker, Marker, Popup } from 'react-leaflet'
import HeatmapLayer from 'react-leaflet-heatmap-layer'

import { useLink } from '../../../hooks/useHtml'

const shortid = require('shortid')

const HeatMap = ({ data, settings }) => {
  const [points, setPoints] = useState([])
  const [loading1] = useLink('https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.0/leaflet.css')  
  const [loading2] = useLink('https://unpkg.com/leaflet@1.6.0/dist/leaflet.css')
  const loading = loading1 && loading2

  useEffect(() => {
    const newPoints = Object.entries(data).map(([latLng, subCategories]) => {
      const [lat, lng] = latLng.split('&')
      const count = subCategories['Total Count']
      return ({
        coordinates: [Number(lat)/10, Number(lng)/10],
        intensity: count
      })
    })
    setPoints(newPoints)
  }, [data])

  return (
    <Col>
      {!loading && (
        <Map
          key={shortid.generate()}
          center={[37.3230, 122.0322]}
          zoom={6}
          maxZoom={50}
          scrollWheelZoom
          dragging
          style={{ width: '100%', height: '600px' }}
        >
          <HeatmapLayer
            fitBoundsOnLoad
            points={points}
            radius={20}
            longitudeExtractor={p => p.coordinates[1]}
            latitudeExtractor={p => p.coordinates[0]}
            intensityExtractor={p => p.intensity}
            maxZoom={50}
          />
          <TileLayer
            url="https://raster-standard.geo.apple.com/tile?style=0&z={z}&x={x}&y={y}"
          />
        </Map>
      )}
    </Col>
  )
}

export default React.memo(HeatMap)
