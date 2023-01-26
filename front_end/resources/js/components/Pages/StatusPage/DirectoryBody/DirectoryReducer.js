/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
import produce from 'immer'
import { sendToServer } from '../../../../utilities/helpers'
import Constants from '../../../../utilities/constants'

const _ = require('underscore')

export const TECHNOLOGIES = 'TECHNOLOGIES'
export const TEST_DATES = 'TEST_DATES'
export const FIELDTESTS = 'FIELDTESTS'
export const RESET = 'RESET'
const FETCH_TECHNOLOGIES = 'FETCH_TECHNOLOGIES'
const FETCH_TEST_DATES = 'FETCH_TEST_DATES'
const FETCH_FIELDTESTS = 'FETCH_FIELDTESTS'


export const initialDirectoryState = {
  allTechnologies: null
}

export function DirectoryReducer(state, action) {
  switch (action.type) {
    case FETCH_TECHNOLOGIES: {
      return { ...state, allTechnologies: action.payload }
    }
    case FETCH_TEST_DATES: {
      return {
        ...state,
        allTechnologies: produce(state.allTechnologies, (draftState) => {
          const technologyIndex = _.indexOf(_.pluck(state.allTechnologies, 'id'), action.technology)
          const featureIndex = _.indexOf(_.pluck(state.allTechnologies[technologyIndex].children, 'id'), action.feature)
          draftState[technologyIndex].children[featureIndex].children = action.payload
        })
      }
    }
    case FETCH_FIELDTESTS: {
      return {
        ...state,
        allTechnologies: produce(state.allTechnologies, (draftState) => {
          const technologyIndex = _.indexOf(_.pluck(state.allTechnologies, 'id'), action.technology)
          const featureIndex = _.indexOf(_.pluck(state.allTechnologies[technologyIndex].children, 'id'), action.feature)
          const testDatesIndex = _.indexOf(_.pluck(state.allTechnologies[technologyIndex].children[featureIndex].children, 'id'), action.testDate)
          draftState[technologyIndex].children[featureIndex].children[testDatesIndex].children = action.payload
        })
      }
    }

    default:
      return state
  }
}

function findChild(address, allTechnologies) {
  if (address.length === 0) {
    return allTechnologies !== null
  }
  const child = _.filter(allTechnologies, item => item.id === address[0])
  return (child.length !== 0 && findChild(address.slice(1), child[0].child))
}
const FetchFieldtestReOrg = (payload) => {
  let fieldtestMapping = Object.assign({}, ...payload.map((x) => ({
    [x.id]:
    {
      "id": x.id,
      "label": x.name,
      "type": "Fieldtest",
      "is_deleted": x.is_deleted,
      "trains": [],
      "children": []
    }
  }
  )));
  payload.forEach(fieldtest => {
    if (fieldtestMapping[fieldtest.id].trains.indexOf(fieldtest.archive_fieldtest__build_train) === -1) {
      fieldtestMapping[fieldtest.id].trains.push(fieldtest.archive_fieldtest__build_train)
      fieldtestMapping[fieldtest.id].children.push({
        "id": fieldtest.archive_fieldtest__build_train,
        "label": fieldtest.archive_fieldtest__build_train,
        "type": "Train",
        "children": []
      })

    }
  })

  payload.forEach(fieldtest => {
    let train_index = fieldtestMapping[fieldtest.id].trains.indexOf(fieldtest.archive_fieldtest__build_train)
    return fieldtestMapping[fieldtest.id].children[train_index].children.push({
      "id": fieldtest.archive_fieldtest__id,
      "type": "Archive",
      "label": fieldtest.archive_fieldtest__model_hardware,
      "is_deleted": fieldtest.archive_fieldtest__is_deleted,
      "device_type": fieldtest.archive_fieldtest__device_type,
      "pipelinestate": fieldtest.archive_fieldtest__pipelinestate__name,
      "archive_type": fieldtest.archive_fieldtest__archivetype__name
    })
  }
  );
  payload.forEach(fieldtest => {
    delete fieldtestMapping[fieldtest.id].trains
  })
  return Object.values(fieldtestMapping)
}
export function getDirectoryData(dataType, info, directoryState, dispatch, callback = null) {
  if (dataType !== RESET && findChild(Object.values(info), directoryState.allTechnologies)) {
    console.log('Already fetched .... ')
    return null
  }
  console.log('Fetching data .... ')
  let url = ''
  let pkg = null
  switch (dataType) {
    case RESET:
    case TECHNOLOGIES:
      url = Constants.TECHNOLOGY_API
      pkg = { ...info, type: FETCH_TECHNOLOGIES }
      break
    case TEST_DATES:
      url = `${Constants.TESTDATE_API + info.technology}/${info.feature}`
      pkg = { ...info, type: FETCH_TEST_DATES }
      break
    case FIELDTESTS:
      url = `${Constants.FIELDTEST_API + info.technology}/${info.feature}/${info.testDate}/by_test_date/`
      pkg = { ...info, type: FETCH_FIELDTESTS }
      break
    default:
      return null
  }

  sendToServer(url, {}, 'get', (payload) => {
    if (pkg.type === FETCH_FIELDTESTS) {
      payload = FetchFieldtestReOrg(payload)
    }
    dispatch({
      ...pkg,
      payload
    })
    if (callback) callback()
  })
  return null
}
