/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { useState, useEffect, Suspense, lazy } from 'react'
import {
  Redirect,
  useParams,
  useHistory
} from 'react-router-dom'
import { Breadcrumbs } from '@tidbits/react-tidbits'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { Navigation, NavigationItem } from '@dx/continuum-navigation'

import { CTP, PERFORMANCE } from '../../../utilities/constants'
import { 
  useQuery, 
  createArchiveLabel, 
  getArchiveFilterParams, 
  size, 
  getUrlQueryParams 
} from '../../../utilities/helpers'

import { useFetchRafael } from '../../../hooks/fetchData'
import CTPDeviceReport from './CTPDeviceReport'
import FindMyDeviceDetails from './R1/FindMyDeviceDetails'

const ClxGFDeviceDetails = lazy(() => import('./Clx/ClxGFDeviceDetails'))
const ClxGeneralDeviceDetails = lazy(() => import('./Clx/ClxGeneralDeviceDetails'))
const DeviceCrashes = lazy(() => import('./DeviceCrashes'))
const GnssDeviceDetails = lazy(() => import('./Gnss/GnssDeviceDetails'))
const TTFFDeviceDetails = lazy(() => import('./Gnss/TTFFDeviceDetails'))
const E911DeviceDetails = lazy(() => import('./E911/E911DeviceDetails'))
const ORDeviceDetails = lazy(() => import('./R1/ORDeviceDetails'))
const RoutineDeviceDetails = lazy(() => import('./Routine/RoutineDeviceDetails'))
const BADeviceDetails = lazy(() => import('./BlueAvengers/BADeviceDetails'))
const TablePreview = lazy(() => import('./TablePreview'))


const _ = require('underscore')

const GROUP_BY = 'archive'

const getDefaultTabIdx = (technology, feature) => {
  switch (true) {
    case technology === 'CLX' && feature === 'WSB':
      return 2
    default:
      return 0
  }
}

const getArchiveTabs = (technology, feature, reportType) => {
  switch (true) {
    case reportType === CTP:
      return ['Time Series', 'Table Preview']
    case technology === 'CLX' && feature === "GEOFENCING":
      return [
        'Geofencing Map', 'Geofencing Time Series', 'WSB Map', 'WSB Plots', 'Table Preview', 'Crashes'
      ]
    case technology === 'CLX' && feature === "SEPARATIONALERTS":
      return ['Details', 'Map', 'Time Series', 'Table Preview', 'Crashes']
    case technology === 'CLX' && feature === "MICROLOCATIONS":
      return ['Time Series', 'Table Preview', 'Crashes']
    case technology === 'GNSS' && feature === 'TTFF':
      return ['Time Series', 'Table Preview']
    case technology === 'GNSS' && feature !== 'TTFF':
      return ['L5', 'Cell Usage', 'Map', 'Table Preview', 'Crashes']
    case technology === 'E911':
      return ['Call Sessions', 'Table Preview']
    case technology === 'R1' && ['OR', 'FINDBTRSSI'].includes(feature):
      return ['Plots', 'Table Preview', 'Crashes']
    case technology === 'ROUTINE' && feature === 'SLV':
      return ['Tables', 'Map', 'Table Preview', 'Crashes']
    case technology === 'ROUTINE' && feature === 'LOIPROVIDER':
      return ['Tables', 'Map', 'Time Series', 'Table Preview', 'Crashes']
    case technology === 'BA' && feature === 'OFFLINEFINDING':
      return ['Map', 'Table Preview', 'Crashes']
    case technology === 'BA':
      return ['Table Preview', 'Crashes']
    case technology === 'CLX':
      return ['Table Preview', 'Crashes']
    case technology === 'ROUTINE':
      return ['Table Preview', 'Crashes']
    case technology === 'R1':
      return ['Table Preview', 'Crashes']
    default:
      return ['Table Preview']
  }
}


const TechnologyDetails = ({ technology, feature, archive, selectedTab, reportType, group }) => {
  switch (true) {
    case reportType === CTP:
      return (
        <CTPDeviceReport technology={technology} feature={feature} archive={archive} tab={selectedTab} group={group}/>
      )
    case technology === 'CLX' && feature === 'GEOFENCING':
      return (
        <ClxGFDeviceDetails feature={feature} archive={archive} tab={selectedTab} />
      )
    case technology === 'CLX' && (feature === 'SEPARATIONALERTS' || feature === 'MICROLOCATIONS'):
      return (
        <ClxGeneralDeviceDetails feature={feature} archive={archive} tab={selectedTab} />
      )
    case technology === 'GNSS' && feature === 'TTFF':
      return (
        <TTFFDeviceDetails feature={feature} archive={archive} tab={selectedTab} />
      )
    case technology === 'GNSS' && feature !== 'TTFF':
      return (
        <GnssDeviceDetails feature={feature} archive={archive} tab={selectedTab} />
      )
    case technology === 'E911':
      return (
        <E911DeviceDetails feature={feature} archive={archive} tab={selectedTab} />
      )
    case technology === 'R1' && feature === 'OR':
      return (
        <ORDeviceDetails archive={archive} tab={selectedTab} />
      )
    case technology === 'R1' && feature === 'FINDBTRSSI':
      return (
        <FindMyDeviceDetails feature={feature} archive={archive} tab={selectedTab} />
      )
    case technology === 'ROUTINE':
      return (
        <RoutineDeviceDetails feature={feature} archive={archive} tab={selectedTab} />
      )
    case technology === 'BA' && feature === 'OFFLINEFINDING':
      return (
        <BADeviceDetails feature={feature} archive={archive} tab={selectedTab}/>
      )
    default:
      return null
  }
}

const URL_QUERY_PARAMS = [
  'groupName',
]


const DeviceDetails = () => {
  const history = useHistory()
  const { technology: urlTechnology, feature: urlFeature, archiveId, reportType = PERFORMANCE } = useParams()
  const urlQuery = useQuery()
  const {
    groupName: groupNameString,
  } = getUrlQueryParams(urlQuery, URL_QUERY_PARAMS)
  const technology = urlTechnology.toUpperCase()
  const feature = urlFeature.toUpperCase()
  const queryString = `fieldtests_archive.id = '${archiveId}'`
  const [isLoading, archiveData] = useFetchRafael(getArchiveFilterParams(queryString, GROUP_BY), [])
  const [archive, setArchive] = useState({})
  const tabs = getArchiveTabs(technology, feature, reportType)
  const [selectedTab, setSelectedTab] = useState(tabs[getDefaultTabIdx(technology, feature)])
  const { errorMessage } = archiveData

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const [newArchive] = archiveData[archiveId]
      setArchive(newArchive)
    }
  }, [isLoading, errorMessage, archiveId, archiveData])

  const handleFieldTestClick = (fieldTestId) => {
    const prevFeature = feature === 'WSB' ? 'GEOFENCING' : feature
    history.push(`/technology/${technology}/${prevFeature}/${reportType}/report/${fieldTestId}`)
  }

  const handleTestDateClick = (testDate) => {
    history.push(`/technology/${technology}/${feature}/${reportType}/report/q?testDate=${testDate}`)
  }
  
  if (errorMessage) {
    return <Redirect to="/error" />
  }

  if (isLoading || size(archive) === 0) {
    return <div className="spinner-gray"><Spinner visible /></div>
  }

  console.log('Rendering DeviceDetails')
  return (
    <Suspense fallback={<div className="spinner-gray"><Spinner visible /></div>}>
      <h1 className="dashboard-title">{`${createArchiveLabel(archive).label}`}</h1>
      {(reportType !== CTP && technology !== 'E911') ? (
        <Breadcrumbs textStyle="h4Regular" mb="25px">
          <Breadcrumbs.Crumb clickable={true} onClick={() => handleFieldTestClick(archive.fieldtest)}>
            {`${archive.fieldtest_name} (${archive.test_date})`}
          </Breadcrumbs.Crumb>
        </Breadcrumbs>
      ) : (
        <Breadcrumbs textStyle="h4Regular" mb="25px">
          <Breadcrumbs.Crumb clickable={true} onClick={() => handleTestDateClick(archive.test_date)}>
            {`${archive.test_date}`}
          </Breadcrumbs.Crumb>
        </Breadcrumbs>
      )}
      <Navigation direction='horizontal'>
        {tabs.map(tab => (
          <NavigationItem
            key={tab} 
            variant="tab"
            onClick={() => setSelectedTab(tab)}
            active={selectedTab === tab}
          >
            {tab}
          </NavigationItem>
        ))}
      </Navigation>
      {selectedTab === 'Table Preview' ? (
        <TablePreview archive={archive} />
      ) : (
        <TechnologyDetails
          technology={technology}
          feature={feature}
          archive={archive}
          selectedTab={selectedTab}
          reportType={reportType}
          group={groupNameString}
        />
      )}
      {selectedTab === 'Crashes' && (
        <DeviceCrashes archives={[archive]} />
      )}
    </Suspense>
  )
}

export default React.memo(DeviceDetails)
