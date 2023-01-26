import React from 'react'
import { shallow, mount } from 'enzyme'

import { dateState, filters } from '../__data__/testData'

import ArchivePieChart from '../resources/js/components/Plots/ArchivePieChart'
import Cdf, { getArchiveCdfs } from '../resources/js/components/Plots/Cdf'
import Histogram from '../resources/js/components/Plots/Histogram'
import TimeSeries from '../resources/js/components/Plots/TimeSeries'
import StackedBarChart from '../resources/js/components/Plots/StackedBarChart'
import { KPI_NAMES } from '../resources/js/utilities/constants'

const archivesInfo = require('../__data__/archivesInfo.json')


describe('Plots', () => {
  it('<ArchivePieChart /> renders without crashing', () => {
    const wrapper = shallow(<ArchivePieChart dateState={dateState} />)
  }) 
  it('<Cdf /> renders without crashing', () => {
    const wrapper = shallow(<Cdf technology="GNSS" archives={[]} filters={filters} />)
  }) 
  it('<Histogram /> renders without crashing', () => {
    const wrapper = shallow(<Histogram dateState={dateState} />)
  }) 
  it('<StackedBarChart /> renders without crashing', () => {
    const wrapper = shallow(<StackedBarChart dateState={dateState} />)
  }) 
  it('<TimeSeries /> renders without crashing', () => {
    const wrapper = shallow(<TimeSeries technology="CLX" feature="GEOFENCING" archives={[]} />)
  }) 
})

describe('Archives Info Processing', () => {
  it('getArchiveCdf retrieves all data as numbers', () => {
    const archiveCdfs = getArchiveCdfs(
      archivesInfo,
      {
        'f2831310-a1c4-11ea-811a-a81e8494b32f': {
          label: 'test-test test-test',
          color: 'test'
        }
      },
      'GNSS',
      filters
    )
    Object.values(archiveCdfs).forEach((dataPoints) => {
      dataPoints.forEach((dataPoint) => {
        Object.entries(dataPoint).forEach((entry) => {
          const [archiveId, value] = entry
          expect(typeof value).toBe('number')
        })
      })
    })
  })
})