/* eslint-disable react/prop-types */
import React, {lazy} from 'react'

const GnssCTPDeviceGrouping = lazy(() => import('./Gnss/GnssCTPDeviceGrouping'))

const CTPDeviceReport = ({
  technology,
  feature,
  archive,
  tab,
  group
}) => {

  console.log('Rendering CTPDeviceReport')
  return (
    <>
      {tab === 'Time Series' && (
        <GnssCTPDeviceGrouping 
          technology={technology}
          feature={feature}
          archive={archive}
          group={group}
        />
      )}
    </>
  )
}

export default React.memo(CTPDeviceReport)
