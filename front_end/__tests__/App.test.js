import React from 'react'
import { shallow } from 'enzyme'
import Master from '../resources/js/App'


describe('App', () => {
  it('<Master /> renders without crashing', () => {
    const wrapper = shallow(<Master />)
  })
})