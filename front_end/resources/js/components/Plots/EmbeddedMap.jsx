import React, { lazy, Suspense, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'react-bootstrap'
import { StatePanel } from '@dx/continuum-state-panel'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import pako from 'pako'

import { useScripts, useLink } from '../../hooks/useHtml'
import { useFetchArchiveData } from '../../hooks/fetchData'
import { ARCHIVE_REPORTING_LOGS, MAP_TABLE } from '../../utilities/constants'
import { isEmpty } from '../../utilities/helpers'


const getMapInfo = (technology, feature) => {
  switch (true) {
    case technology === 'GNSS':
      return { tableName: `r_gnss_${feature.toLowerCase()}_k_ui_maps_geojson` }
    default:
      return MAP_TABLE[technology][feature]
  }
} 

const EmbeddedMap = ({ technology, feature, archive }) => {
  const { tableName } = getMapInfo(technology, feature)
  const { id: archiveId } = archive
  useLink('https://unpkg.com/leaflet@1.6.0/dist/leaflet.css')
  useLink('https://code.jquery.com/ui/1.9.2/themes/base/jquery-ui.css')
  useLink('https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.0/leaflet.css')
  useLink('/static/webpack_bundles/_map_resources/css/style.css')
  const [loadingScripts] = useScripts([
    '/static/webpack_bundles/_map_resources/GeofenceMapPlot.js',
    '/static/webpack_bundles/_map_resources/SliderControl.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js',
    'https://code.jquery.com/jquery-3.2.1.min.js',
    'https://unpkg.com/leaflet@1.6.0/dist/leaflet.js'
  ])
  const [loadingData, mapJson] = useFetchArchiveData([archiveId], ARCHIVE_REPORTING_LOGS, tableName)
  const isLoading = loadingScripts || loadingData
  const { errorMessage } = mapJson


  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const script = document.createElement('script')
      if (!isEmpty(mapJson[archiveId])) {
        let jsonData
        try {
          jsonData = pako.inflate(atob(mapJson[archiveId].json_data), { to: 'string' })
        } catch (e) {
          jsonData = mapJson[archiveId].json_data
        }
        const dataToPlot = JSON.parse(jsonData)
        script.innerHTML = generateMap("mapid", [37.331242, -122.0293339], 13, dataToPlot)
      }
      document.body.appendChild(script)
      return (() => {
        document.body.removeChild(script)
      })
    }
  }, [isLoading, errorMessage, mapJson])

  console.log('Rendering EmbeddedMap')
  return (
    <div className="map-view">
      {(!loadingData && isEmpty(mapJson[archiveId])) && <StatePanel message="No map data to show" />}
      <div id="mapid" />
      <Spinner visible={isLoading} />
    </div>
  )
}


export default React.memo(EmbeddedMap)
