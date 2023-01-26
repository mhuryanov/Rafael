import React from 'react'
import { shallow } from 'enzyme'
import { MemoryRouter } from 'react-router-dom'

import { userInfo, defaultState } from '../__data__/testData'
import { StateContext } from '../resources/js/components/StateContext'

import MainNavBar from '../resources/js/components/Nav/MainNavBar'
import PageNav from '../resources/js/components/Nav/PageNav'

global.userInfo = userInfo


describe('Nav', () => {
  it('<MainNavBar /> renders without crashing', () => {
    const wrapper = shallow(
      <StateContext.Provider value={defaultState}>
        <MainNavBar />
      </StateContext.Provider>
    )
  }) 
  it('<PageNav /> renders without crashing', () => {
    const wrapper = shallow(
      <MemoryRouter initialEntries={['/']}>
        <PageNav />
      </MemoryRouter>
    )
  }) 
})