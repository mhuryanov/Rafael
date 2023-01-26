import UserPreferences from '../resources/js/utilities/UserPreferences'

export const dateState = {
  startDate: null,
  endDate: null,
  dateGroup: { label: 'Default', value: null }
}

export const filters = {
  archiveIds: [],
  devices: [],
  buildTrains: [],
  kpis: [],
  customFilters: {
    segment: 'ENTIREDRIVE'
  }
}

export const userInfo = {
  email: 'test@apple.com'
}

export const defaultState = {
  technologyFeatures: {
    TEST: 'TEST'
  },
  userPreferences: new UserPreferences()
}