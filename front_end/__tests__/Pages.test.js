import React from 'react'
import { shallow } from 'enzyme'
import { MemoryRouter } from 'react-router-dom'

import { dateState, userInfo, defaultState } from '../__data__/testData'
import { StateContext } from '../resources/js/components/StateContext'

import ErrorPage from '../resources/js/components/Pages/ErrorPage'
import HomePage from '../resources/js/components/Pages/HomePage/HomePage'

import StatusPage from '../resources/js/components/Pages/StatusPage/StatusPage'
import PipelineDashboard from '../resources/js/components/Pages/StatusPage/PipelineDashboard'

import SettingsPage from '../resources/js/components/Pages/SettingsPage/SettingsPage'
import SettingsList from '../resources/js/components/Pages/SettingsPage/SettingsList'
import UserPage from '../resources/js/components/Pages/SettingsPage/User/UserPage'
import UserSinglePreferences from '../resources/js/components/Pages/SettingsPage/User/UserSinglePreferences'
import UserMultiPreferences from '../resources/js/components/Pages/SettingsPage/User/UserMultiPreferences'
import DriPage from '../resources/js/components/Pages/SettingsPage/DRI/DriPage'
import DriTechnologyForm from '../resources/js/components/Pages/SettingsPage/DRI/DriTechnologyForm'
import DriFeatureForm from '../resources/js/components/Pages/SettingsPage/DRI/DriFeatureForm'
import FeatureForm from '../resources/js/components/Pages/SettingsPage/DRI/FeatureForm'
import MultiSelectForm from '../resources/js/components/Pages/SettingsPage/DRI/MultiSelectForm'
import SegmentMappingForm from '../resources/js/components/Pages/SettingsPage/DRI/SegmentMappingForm'

import ArchiveFilter from '../resources/js/components/Pages/SearchPage/ArchiveFilter/ArchiveFilter'
import SearchPage from '../resources/js/components/Pages/SearchPage/SearchPage'
import SearchBody from '../resources/js/components/Pages/SearchPage/SearchBody'
import SearchResult from '../resources/js/components/Pages/SearchPage/SearchResult'

import ReportCatalog from '../resources/js/components/Pages/TechnologyPage/ReportCatalog'
import TechnologyDashboard from '../resources/js/components/Pages/TechnologyPage/TechnologyDashboard'
import TechnologyPage from '../resources/js/components/Pages/TechnologyPage/TechnologyPage'
import FieldTestReport from '../resources/js/components/Pages/TechnologyPage/FieldTestReport'
import FeatureList from '../resources/js/components/Pages/TechnologyPage/FeatureList'
import ZaxisTrend from '../resources/js/components/Pages/TechnologyPage/Livability/ZaxisTrend'
import GnssSummary from '../resources/js/components/Pages/TechnologyPage/Gnss/GnssSummary'

global.userInfo = userInfo


describe('Pages', () => {
  it('<ErrorPage /> renders without crashing', () => {
    const wrapper = shallow(
      <MemoryRouter initialEntries={['/error']}>
        <ErrorPage />
      </MemoryRouter>
    )
  })
  it('<HomePage /> renders without crashing', () => {
    const wrapper = shallow(
      <MemoryRouter initialEntries={['/home']}>
        <HomePage />
      </MemoryRouter>
    )
  })
  it('<StatusPage /> renders without crashing', () => {
    const wrapper = shallow(
      <MemoryRouter initialEntries={['/status']}>  
        <StatusPage />
      </MemoryRouter>
    )
  })
  it('<PipelineDashboard /> renders without crashing', () => {
    const wrapper = shallow(
      <StateContext.Provider value={defaultState}>
        <PipelineDashboard technologies={[]} />
      </StateContext.Provider>
    )
  }) 

  it('<SettingsPage /> renders without crashing', () => {
    const wrapper = shallow(
      <MemoryRouter initialEntries={['/settings']}> 
        <SettingsPage />
      </MemoryRouter>
    )
  }) 
  it('<SettingsList /> renders without crashing', () => {
    const wrapper = shallow(
      <MemoryRouter initialEntries={['/settings/dri']}> 
        <SettingsList />
      </MemoryRouter>
    )
  }) 
  it('<UserPage /> renders without crashing', () => {
    const wrapper = shallow(
      <StateContext.Provider value={defaultState}>
        <UserPage />
      </StateContext.Provider>
    )
  })
  it('<UserSinglePreferences /> renders without crashing', () => {
    const wrapper = shallow(
      <StateContext.Provider value={defaultState}>
        <UserSinglePreferences preferences={defaultState.userPreferences} type="homePreferences" />
      </StateContext.Provider>
    )
  })
  it('<UserMultiPreferences /> renders without crashing', () => {
    const wrapper = shallow(
      <StateContext.Provider value={defaultState}>
        <UserMultiPreferences preferences={defaultState.userPreferences} type="technologyPreferences" />
      </StateContext.Provider>
    )
  })
  it('<DriPage /> renders without crashing', () => {
    const wrapper = shallow(
      <StateContext.Provider value={defaultState}>
        <DriPage />
      </StateContext.Provider>
    )
  }) 
  it('<DriTechnologyForm /> renders without crashing', () => {
    const wrapper = shallow(
      <StateContext.Provider value={defaultState}>
        <DriTechnologyForm technology="TEST" permission="ADMIN" />
      </StateContext.Provider>
    )
  }) 
  it('<DriFeatureForm /> renders without crashing', () => {
    const wrapper = shallow(
      <StateContext.Provider value={defaultState}>
        <DriFeatureForm technology="TEST" permission="ADMIN" />
      </StateContext.Provider>
    )
  }) 
  it('<FeatureForm /> renders without crashing', () => {
    const wrapper = shallow(
      <StateContext.Provider value={defaultState}>
        <FeatureForm technology="TEST" features={[]} />
      </StateContext.Provider>
    )
  })
  it('<MultiSelectForm /> renders without crashing', () => {
    const wrapper = shallow(
      <StateContext.Provider value={defaultState}>
        <MultiSelectForm />
      </StateContext.Provider>
    )
  })
  it('<SegmentMappingForm /> renders without crashing', () => {
    const wrapper = shallow(<SegmentMappingForm />)
  })

  it('<ArchiveFilter /> renders without crashing', () => {
    const wrapper = shallow(
      <MemoryRouter initialEntries={['/search']}> 
        <ArchiveFilter />
      </MemoryRouter>
    )
  }) 
  it('<SearchResult /> renders without crashing', () => {
    const wrapper = shallow(<SearchResult technology="TEST" archives={[]} groupBy="test" groupName="test" />)
  }) 
  it('<SearchBody /> renders without crashing', () => {
    const wrapper = shallow(
      <MemoryRouter initialEntries={['/search']}>
        <SearchBody />
      </MemoryRouter>
    )
  }) 
  it('<SearchPage /> renders without crashing', () => {
    const wrapper = shallow(<SearchPage />)
  })

  it('<TechnologyPage /> renders without crashing', () => {
    const wrapper = shallow(
      <StateContext.Provider value={defaultState}>
        <MemoryRouter initialEntries={['/technology/TEST/TEST']}>
          <TechnologyPage />
        </MemoryRouter>
      </StateContext.Provider>
    )
  }) 
  it('<ReportCatalog /> renders without crashing', () => {
    const wrapper = shallow(<ReportCatalog dateState={dateState} />)
  }) 
  it('<TechnologyDashboard /> renders without crashing', () => {
    const wrapper = shallow(
      <StateContext.Provider value={defaultState}>
        <MemoryRouter initialEntries={['/technology/TEST/TEST']}>
          <TechnologyDashboard />
        </MemoryRouter>
      </StateContext.Provider>
    )
  }) 
  it('<FieldTestReport /> renders without crashing', () => {
    const wrapper = shallow(
      <StateContext.Provider value={defaultState}>
        <MemoryRouter initialEntries={['/technology/TEST/report/test']}> 
          <FieldTestReport />
        </MemoryRouter>
      </StateContext.Provider>
    )
  }) 
  it('<FeatureList /> renders without crashing', () => {
    const wrapper = shallow(
      <StateContext.Provider value={defaultState}>
        <MemoryRouter initialEntries={['/technology/TEST']}>
          <FeatureList />
        </MemoryRouter>
      </StateContext.Provider>
    )
  }) 
  it('<ZaxisTrend /> renders without crashing', () => {
    const wrapper = shallow(
      <MemoryRouter initialEntries={['/technology/ZAXIS/dashboard']}>
        <ZaxisTrend />
      </MemoryRouter>
    )
  }) 
  it('<GnssSummary /> renders without crashing', () => {
    const wrapper = shallow(<GnssSummary archives={[]} />)
  }) 
})