import React from 'react'
import { shallow } from 'enzyme'
import { MemoryRouter } from 'react-router-dom'

import {ARCHIVE_COMPLETED_STATUS } from '../resources/js/utilities/constants'
import { dateState, defaultState } from '../__data__/testData'
import { StateContext } from '../resources/js/components/StateContext'

import ArchiveHistory from '../resources/js/components/Widgets/ArchiveHistory'
import DetailsLink from '../resources/js/components/Widgets/DetailsLink'
import DateRange from '../resources/js/components/Widgets/DateRange'
import HelpTooltip from '../resources/js/components/Widgets/HelpTooltip'
import Filter from '../resources/js/components/Widgets/Filter'
import PipelineStatusBar from '../resources/js/components/Widgets/PipelineStatusBar'
import ReProcess from '../resources/js/components/Widgets/ReProcess'


describe('Widgets', () => {
  it('<ArchiveHistory /> renders without crashing', () => {
    const wrapper = shallow(<ArchiveHistory />)
  }) 
  it('<DetailsLink /> renders without crashing', () => {
    const wrapper = shallow(<DetailsLink />)
  }) 
  it('<DateRange /> renders without crashing', () => {
    const wrapper = shallow(<DateRange dateState={dateState} />)
  }) 
  it('<HelpTooltip /> renders without crashing', () => {
    const wrapper = shallow(<HelpTooltip />)
  })
  it('<Filter /> renders without crashing', () => {
    const wrapper = shallow(<Filter title="TEST" type="TEST" items={[]} filters={{ TEST: [] }} setFilters={null} />)
  }) 
  it('<PipelineStatusBar /> renders without crashing', () => {
    const wrapper = shallow(<PipelineStatusBar archive={{ technology: 'TEST', feature: 'TEST', archive_type: 'TEST', pipelinestate: 'TEST' }}/>)
  }) 
  it('<ReProcess /> renders without crashing', () => {
    const wrapper = shallow(
    <StateContext.Provider value={defaultState}>
      <ReProcess pipelineState={ARCHIVE_COMPLETED_STATUS} />
    </StateContext.Provider>
  )
  })
})