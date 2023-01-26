/* eslint-disable react/prop-types */
import React, { Suspense, useState, lazy } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Text } from '@tidbits/react-tidbits'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { SegmentedButton } from '@dx/continuum-segmented-button'

import { CTP, FITNESS_FEATURES } from '../../../../utilities/constants'
import HelpTooltip from '../../../Widgets/HelpTooltip'

const TimeSeries = lazy(() => import('../../../Plots/TimeSeries'))

const ALL_CTP_GROUPS = ['General', 'L5', 'MapMatcher', 'Odometer2.0', 'Smoother2.0','Raven', 'RavenWatch', 'MAPS377',
'5G-CellPositioning']

const getCTPGroups = (technology, feature) => {
  switch (true) {
    case technology === 'GNSS' && FITNESS_FEATURES.includes(feature):
      return feature === 'MAPS377' ? ['MAPS377'] : ALL_CTP_GROUPS.slice(0, -1)
    case technology === 'GNSS' && feature === 'DRIVE':
      return ['General', 'L5', 'Raven', 'RavenWatch', '5G-CellPositioning']
    default:  // GNSS TTFF
      return []
  }
}

const GnssCTPDeviceGrouping = ({
  technology,
  feature,
  archive,
  group
}) => {
  const [selectedGroup, setSelectedGroup] = useState(group)
  const CTP_GROUPS = getCTPGroups(technology, feature)

  const queryString = selectedGroup ? `table_name='${selectedGroup}'` : ''

  const handleGroupSelect = (tab) => {
    setSelectedGroup(tab)
  }

  console.log('Rendering GnssCTPDeviceGrouping')
  return (
    <>
      <Col style={{ marginTop: '25px' }}>
        <div className="tab-header">Group</div>
        <SegmentedButton 
          segments={CTP_GROUPS}
          onChange={handleGroupSelect}
          active={selectedGroup}
        />
      </Col>
      {(selectedGroup && CTP_GROUPS.includes(selectedGroup)) && (
        <div key={selectedGroup}>
          <Row>
            <Col className="box report-plot">
              <h1 className="plot-title" style={{ marginTop: '25px' }}>
                Time Series Plots
                <HelpTooltip title="Tips" content={<Text>Click and drag on plots to zoom</Text>} />
              </h1>
              <Suspense fallback={<Spinner visible />}>
                <TimeSeries technology={technology} feature={feature} archives={[archive]} reportType={CTP} queryString={queryString}/>
              </Suspense>
            </Col>
          </Row>
        </div>
      )}
    </>
  )
}

export default React.memo(GnssCTPDeviceGrouping)
