import React from 'react'
import { shallow } from 'enzyme'
import { MemoryRouter } from 'react-router-dom'

import { filters } from '../__data__/testData'

import ResultsTable from '../resources/js/components/Tables/ResultsTable'
import SummaryTable from '../resources/js/components/Tables/SummaryTable'


describe('Tables', () => {
  it('<ResultsTable /> renders without crashing', () => {
    const wrapper = shallow(
      <MemoryRouter initialEntries={['/technology/TEST']}>
        <ResultsTable results={{}} />
      </MemoryRouter>
  )
  }) 
  it('<SummaryTable /> renders without crashing', () => {
    const wrapper = shallow(<SummaryTable archives={[]} technology="GNSS" filters={filters} />)
  }) 
})