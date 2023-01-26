/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
import { store } from 'react-notifications-component'
import { useLocation } from 'react-router-dom'
import Constants from './constants'

const _ = require('underscore')
const XXH = require('xxhashjs')


export function StringToClipboard(str) {
  // Create new element
  const el = document.createElement('textarea')
  // Set value (string to be copied)
  el.value = str
  // Set non-editable to avoid focus and move outside of view
  el.setAttribute('readonly', '')
  el.style = {
    position: 'absolute',
    left: '-9999px'
  }
  document.body.appendChild(el)
  // Select text inside element
  el.select()
  // Copy text to clipboard
  document.execCommand('copy')
  // Remove temporary element
  document.body.removeChild(el)
}

export function AddNotification(message, messageType) {
  store.addNotification({
    message,
    type: messageType,
    insert: 'top',
    container: 'top-right',
    animationIn: ['animated', 'fadeIn'],
    animationOut: ['animated', 'fadeOut'],
    dismiss: {
      duration: 2000,
      onScreen: true
    }
  })
}
export function labelCase(value) {
  const cap = value.replace(/_\w/g, m => ` ${m[1].toUpperCase()}`).replace('Id', 'ID').replace('id', 'ID')
  return cap.charAt(0).toUpperCase() + cap.slice(1)
}


export function createSelectObject(label) {
  if (Array.isArray(label)) {
    return label.map(l => ({ value: l, label: l }))
  }
  return { value: label, label }
}
export function createListFromSelectObject(label) {
  if (label === null) {
    return []
  }
  if (Array.isArray(label)) {
    return label.map(l => l.value)
  }
  return label.value
}
export function getXXHash(str, size = 7) {
  return XXH.h32(0xABCD).update(str).digest().toString(size)
}
export function getDateString(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}
export const getUserInfo = () => getLocalStorage('LOGIN_AS') ? getLocalStorage('LOGIN_AS') : userInfo
export function isUserAdmin() {
  const login_as = getUserInfo()
  return login_as.is_keylime_admin
}

export const canUserEdit = (userPermissions, technology) => {
  const { admins_of, maintainers_of, is_keylime_admin } = userPermissions
  return is_keylime_admin || (admins_of && admins_of.includes(technology)) || (maintainers_of && maintainers_of.includes(technology))
}

export const getLocalStorage = key => (JSON.parse(localStorage.getItem(key)))
export function rafaelFetch(url, data = {}, method = 'GET') {
  // Default options are marked with *
  const loginAs = getUserInfo()
  const { rafaeltoken, admin_rafaeltoken } = loginAs
  const config = {
    method, // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      'KLP-Type': 'KLP-FEnd',
      rafaeltoken: admin_rafaeltoken ? admin_rafaeltoken : rafaeltoken
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer' // no-referrer, *client

  }
  if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    config.body = JSON.stringify(data) // body data type must match "Content-Type" header
  }
  return fetch(url, config)
}

export const sendToServer = (url, data = {}, action = 'get', callBack = null, errorCallBack = null) => {
  console.log(`Sending Request to : ${url}`)
  rafaelFetch(url, data, action)
    .then((response) => {
      if (!response.ok) {
        response.text().then((text) => {
          throw new Error(`Failed to call .${url}. Error: ${text}`)
        }).catch((err) => {
          if (errorCallBack) {
            const errorMessage = `ERROR: ${err.message}`
            errorCallBack(errorMessage)
          }
        })
        return undefined
      }
      return response.json()
    }).then((responseJson) => {
      if (typeof responseJson !== 'undefined') {
        console.log(`Received Request from : ${url}`)
        if (callBack) {
          callBack(responseJson)
        }
      }
    })
}

export function downloadArchive(archiveId) {
  const url = `${Constants.ARCHIVE_API + archiveId}/download/`
  const callBack = (responseJson) => {
    const link = document.createElement('a')
    link.href = responseJson.url
    document.body.appendChild(link)
    link.click()
  }
  sendToServer(url, {}, 'get', callBack)
}

export function downloadArchive(archiveId) {
  const url = `${Constants.ARCHIVE_API + archiveId}/download/`
  const callBack = (responseJson) => {
    const link = document.createElement('a')
    link.href = responseJson.url
    document.body.appendChild(link)
    link.click()
  }
  sendToServer(url, {}, 'get', callBack)
}

/*
Functionality has been tested with expected outputs based on user set conditions. If user inputs multiple conditions, we filter ALL 
and check if storage.meta values in each userMeta field are the same with userMeta value.
 downloadStorage(archive_id, jobName, {file_type: 'ZIP'}) -> Download
 downloadStorage(archive_id, jobName, {file_owner: 'Name'}) -> No Download
 downloadStorage(archive_id, jobName, {file_type: 'ZIP', file_owner: 'Name'}) -> User inputs multiple conditions, treated as "and" -> Download if matching appropriate key/value pair.
 downloadStorage(archive_id, jobName, {}) -> Undefined or empty meta we don't filter (returns true and hence no need to filter).
*/
export function downloadStorage(archiveId, namePattern, userMeta) {
  const url = `${Constants.STORAGE_API}${archiveId}/list_storages/`
  const callBack = (storageInfo) => {
    const bundleToDownload = storageInfo.filter(
      (storage) =>
        storage.download_link &&
        (!userMeta || !Object.keys(userMeta).some((key) => storage.meta[key] != userMeta[key])) &&
        storage.name.includes(namePattern))
    if (bundleToDownload.length > 0) {
      bundleToDownload.forEach((bundle, index) => {
        const url = bundle.download_link
        const a = document.createElement('a')
        a.href = url
        a.click()
      })
    }
  }
  sendToServer(url, {}, 'get', callBack)
}

export function downloadStorageWithExtension(archiveId, namePattern, userMeta) {
  const url = `${Constants.STORAGE_API}${archiveId}/list_storages/`
  const callBack = (storageInfo) => {
    const bundleToDownload = storageInfo.filter(
      (storage) =>
        storage.download_link &&
        (!userMeta || !Object.keys(userMeta).some((key) => storage.meta[key] != userMeta[key])) &&
        storage.name.includes(namePattern))
    if (bundleToDownload.length > 0) {
      bundleToDownload.forEach((bundle, index) => {
        const url = bundle.download_link + ".html"
        fetch(url)
          .then(response => response.blob())
          .then(blob => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
          })
          .catch(console.error)
        // const a = document.createElement('a')
        // a.setAttribute('href', 'data:text/plain;charset=utf-8, ' + encodeURIComponent(document.documentElement.outerHTML));
        // a.download = namePattern
        // document.body.appendChild(a)
        // a.click()
        // document.body.removeChild(a)
      })
    }
  }
  sendToServer(url, {}, 'get', callBack)
}
export function list2TestAreaText(inputList) {
  if (inputList.length === 0) {
    return ''
  }
  const newline = '\r\n'
  return inputList.reduce((accumulator, currentValue) => accumulator + newline + currentValue)
}

export const addToObject = (obj, key, value) => {
  if (key in obj) {
    obj[key] = obj[key].concat(value)
  } else {
    obj[key] = value
  }
}

export const size = obj => Object.keys(obj).length

export const isEmpty = (obj) => {
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).length === 0
  }
  if (Array.isArray(obj)) return obj.length === 0
  return !obj
}

export const useQuery = () => new URLSearchParams(decodeURIComponent(useLocation().search))

export const useCurrentUrl = () => {
  const location = useLocation()
  const { pathname, search } = location
  return pathname + search
}

export const getDeviceName = archive => `${archive.model_hardware}_${archive.device_serial_number.substring(4, 8)} ${archive.build_train}_${archive.build_version}`

export const removeNull = (data) => {
  const noNull = item => item !== 'null'
  return _.filter(data, noNull)
}

export const hashCode = (string) => {
  let hash = 0
  for (let i = 0; i < string.length; i += 1) {
    const charCode = string.charCodeAt(i)
    hash = (hash << 5) - hash + charCode
    hash |= 0
  }
  return hash
}

export const getRandomColor = (seed, offset = 0) => {
  let randomIdx = Math.abs(hashCode(seed)) % Constants.COLOR_ARRAY.length
  if (offset) randomIdx += offset
  if (randomIdx >= Constants.COLOR_ARRAY.length) randomIdx %= Constants.COLOR_ARRAY.length
  return Constants.COLOR_ARRAY[randomIdx]
}

export const createArchiveLabel = (archive, offset = 0) => {
  let label = ""
  if (archive.technology === "REPLAY" && archive.feature === "NEARBYD"){
    label = archive.name
  } else {
    label = getDeviceName(archive)
  }
  return ({
    label,
    color: getRandomColor(archive.id.split('-')[0], offset)
    })
}

export const createArchiveLabels = (archives) => {
  const archiveLabels = {}
  const seenColors = new Set()
  archives.forEach((archive) => {
    let newArchiveLabel = createArchiveLabel(archive)
    let offset = 0
    while (seenColors.has(newArchiveLabel.color) && offset < Constants.COLOR_ARRAY.length) {
      offset += 1
      newArchiveLabel = createArchiveLabel(archive, offset)
    }
    archiveLabels[archive.id] = newArchiveLabel
    seenColors.add(newArchiveLabel.color)
  })
  return archiveLabels
}

export const dateToString = date =>
  // ISO format always uses UTC
  `${date.toISOString().split('T')[0]} GMT`


export const getPreviousDate = (daysAgo, endDate = new Date()) => {
  if (Number.isInteger(daysAgo)) {
    const startDate = new Date(endDate.getTime() - daysAgo * Constants.DAY_IN_MILLISECONDS)
    return startDate
  }
  return null
}

export const getFutureDate = (daysAhead, startDate = newDate()) => {
  if (Number.isInteger(daysAhead)) {
    const endDate = new Date(startDate.getTime() + daysAhead * Constants.DAY_IN_MILLISECONDS)
    return endDate
  }
  return null
}

export const buildQueryString = ({
  technology = 'GNSS',
  feature,
  fieldTestId = '',
  startDate = null,
  endDate = null,
  excludeSpecial = false,
  excludeDeleted = true,
  testNames = null,
  testDates = null,
  testIds = null,
  operator = 'AND'
}) => {
  let queryString = ''
  if (technology) {
    queryString += ` ${queryString === '' ? '' : 'AND '}(fieldtests_technology.name = '${technology}')`
  }
  if (feature) {
    queryString += ` ${queryString === '' ? '' : 'AND '}(fieldtests_feature.name = '${feature}')`
  }
  if (fieldTestId) {
    queryString += ` ${queryString === '' ? '' : 'AND '}(fieldtests_fieldtest.id = '${fieldTestId}')`
  }
  if (startDate) {
    queryString += ` ${queryString === '' ? '' : 'AND '}(fieldtests_fieldtest.test_date BETWEEN '${dateToString(startDate)}' AND '${dateToString(endDate || new Date())}')`
  }
  if (excludeSpecial) {
    queryString += ` ${queryString === '' ? '' : 'AND '}(fieldtests_archivetype.name != 'Special')`
  }
  if (excludeDeleted) {
    queryString += ` ${queryString === '' ? '' : 'AND '}(NOT fieldtests_archive.is_deleted AND NOT fieldtests_fieldtest.is_deleted)`
  }
  let subQueryString = ''
  if (testNames) {
    let testNameQueryString = ''
    testNames.forEach((testName) => {
      testNameQueryString += ` ${testNameQueryString === '' ? '' : 'OR '}(fieldtests_fieldtest.name LIKE '%${testName}%')`
    })
    subQueryString += ` ${subQueryString === '' ? '' : `${operator} `}(${testNameQueryString})`
  }
  if (testDates) {
    let testDateQueryString = ''
    testDates.forEach((testDate) => {
      testDateQueryString += ` ${testDateQueryString === '' ? '' : 'OR '}(fieldtests_fieldtest.test_date = '${dateToString(testDate)}')`
    })
    subQueryString += ` ${subQueryString === '' ? '' : `${operator} `}(${testDateQueryString})`
  }
  if (testIds) {
    let testIdQueryString = ''
    testIds.forEach((testId) => {
      testIdQueryString += ` ${testIdQueryString === '' ? '' : 'OR '}(fieldtests_fieldtest.id = '${testId}')`
    })
    subQueryString += ` ${subQueryString === '' ? '' : `${operator} `}(${testIdQueryString})`
  }
  if (subQueryString) {
    queryString += ` ${queryString === '' ? '' : 'AND '}(${subQueryString})`
  }
  return queryString
}

export const getArchiveFilterParams = (queryString, groupBy, url = Constants.ARCHIVE_FILTER_QUERY) => ({
  url,
  data: {
    selects: [
      'fieldtests_technology.name as technology',
      'fieldtests_feature.name as feature',
      'fieldtests_fieldtest.test_date',
      'fieldtests_fieldtest.id as fieldtest',
      'fieldtests_archive.build_train',
      'fieldtests_archive.build_version',
      'fieldtests_archive.model_hardware',
      'fieldtests_archive.device_ecid',
      'fieldtests_archive.device_serial_number',
      'fieldtests_archive.device_type',
      'fieldtests_archivetype.name as archive_type',
      'fieldtests_archive.id',
      'fieldtests_pipelinestate.name as pipelinestate',
      'fieldtests_fieldtest.name as fieldtest_name',
      'fieldtests_archive.name as archive_name'
    ],
    query_string: queryString,
    group_by: Constants.ARCHIVE_MAPPING[groupBy]
  },
  method: 'POST'
})

export const differenceInDays = (startDate, endDate) => {
  if (startDate instanceof Date && endDate instanceof Date) {
    return Math.floor((endDate.getTime() - startDate.getTime()) / (Constants.DAY_IN_MILLISECONDS))
  }
  if (startDate instanceof Date && !(endDate instanceof Date)) {
    return Math.floor(((new Date()).getTime() - startDate.getTime()) / (Constants.DAY_IN_MILLISECONDS))
  }
  return null
}

export const getDateRangeLabel = (dateRange, startDate, endDate) => {
  if (dateRange && dateRange.value !== 'custom') {
    return dateRange.label
  }
  if (!(endDate instanceof Date)) {
    const timeRange = differenceInDays(startDate, endDate)
    return (
      timeRange in Constants.DATE_RANGE_MAPPING
        ? Constants.DATE_RANGE_MAPPING[timeRange]
        : `${dateToString(startDate)} to ${dateToString(new Date())}`
    )
  }
  return `${dateToString(startDate)} to ${dateToString(endDate)}`
}

export const addLeadingZeroes = (num) => {
  if (num < 10) {
    return `0${num}`
  }
  return `${num}`
}

export const timestampToISOString = (timestamp) => {
  const [date, time, zone] = timestamp.split(' ')
  if (!time) return `${date}T00:00:00.000Z`
  if (!zone) return `${date}T${time}`
  return `${date}T${time}.000${zone.slice(0, 3)}:${zone.slice(3)}`
}

export const filterToggle = (itemList, item) => {
  const newItemList = JSON.parse(JSON.stringify(itemList))
  if (newItemList.includes(item)) {
    newItemList.splice(newItemList.indexOf(item), 1)
  } else {
    newItemList.push(item)
  }
  return newItemList
}

export const reProcessItems = (items, type, jobId, archive_type, callBack = null, errorCallBack = null) => {
  items.forEach((item) => {
    const reProccessingUrl = `${Constants.FIELDTEST_ARCHIVE_SHARED_API}${item}/reproccess`
    sendToServer(reProccessingUrl, { job_id: jobId, archive_type }, 'POST', callBack, errorCallBack)
    console.log(jobId, item)
  })
}

export const isFailedPipelineState = pipelineState => (
  pipelineState.toUpperCase().includes('ERROR') || pipelineState.toUpperCase().includes('FAIL') || pipelineState.toUpperCase().includes('INVALID')
)

export const getPipelineCategory = (pipelineState) => {
  switch (true) {
    case isFailedPipelineState(pipelineState):
      return 'ERROR'
    case pipelineState === Constants.ARCHIVE_COMPLETED_STATUS:
      return 'COMPLETE'
    default:
      return 'PROCESSING'
  }
}

export const getCategoryColor = (category) => {
  switch (category) {
    case 'ERROR':
      return 'crimson'
    case 'COMPLETE':
      return 'limegreen'
    default:
      return 'rgb(0,101,204)'
  }
}

export const getPipelineStatus = (pipelineState) => {
  if (pipelineState === Constants.ARCHIVE_COMPLETED_STATUS) {
    return 'COMPLETED'
  }
  return pipelineState.split('__')[0]
}

export const formatBytes = (fileBytes, decimals = 2) => {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const value = parseInt(fileBytes, 10)
  const d = Math.floor(Math.log(value) / Math.log(1024))
  return `${parseFloat((value / (1024 ** d)).toFixed(decimals))} ${units[d]}`
}

export const setDefaultObject = (obj, key) => {
  if (!(key in obj)) obj[key] = {}
}

export const checkCustomFilters = (customFilters, archiveData) => {
  if (!customFilters) return true
  let isValidData = true
  Object.entries(customFilters).forEach(([filterName, filter]) => {
    if ((filterName in archiveData) && (!archiveData[filterName].includes(filter))) {
      isValidData = false
    }
  })
  return isValidData
}

export const equalsCustomFilters = (customFilters, archiveData, index) => Object.entries(customFilters)
  .reduce((acc, [filterName, filter]) => (
    acc && filterName in archiveData && archiveData[filterName][index] === filter
  ), true)

export const isValidArchiveData = (
  archiveData,
  archiveId,
  archiveLabels,
  filters,
  exclude = []
) => {
  const {
    archiveIds,
    devices,
    buildTrains,
    customFilters
  } = filters
  // Replay/Nearbyd label only set device name. Not do model/train filtering
  if (archiveLabels[archiveId].label.split(' ').length < 2) {
    return !isEmpty(archiveData)
    && (exclude.includes('archives') || archiveIds.includes(archiveId))
    && (exclude.includes('custom') || checkCustomFilters(customFilters, archiveData))
  }
  const deviceType = archiveLabels[archiveId].label.split(' ')[0].split('_')[0]
  const buildTrain = archiveLabels[archiveId].label.split(' ')[1].split('_')[0]
  return !isEmpty(archiveData)
    && (exclude.includes('archives') || archiveIds.includes(archiveId))
    && (exclude.includes('devices') || devices.includes(deviceType))
    && (exclude.includes('buildtrains') || buildTrains.includes(buildTrain))
    && (exclude.includes('custom') || checkCustomFilters(customFilters, archiveData))
}

export const isValidPipelineState = pipelineState => (
  pipelineState
  && (pipelineState === Constants.ARCHIVE_COMPLETED_STATUS || pipelineState.includes('Debug'))
)

export const isValidBuildTrain = buildTrain => (
  buildTrain.toUpperCase() !== 'NOT_FOUND'
  && buildTrain.toUpperCase() !== 'SPECIAL'
)

export const isValidModelHardware = modelHardware => (
  modelHardware.toUpperCase() !== 'NOT_FOUND'
  && modelHardware.toUpperCase() !== 'UNKNOWN'
)

export const encodeQueryParam = param => encodeURIComponent(JSON.stringify(param))

export const decodeQueryParam = (param, query) => {
  if (query.get(param)) {
    return JSON.parse(decodeURIComponent(query.get(param)))
  }
  return []
}

export const getTechnologyFromPath = (pathname) => {
  if (pathname.includes('technology')) {
    const parsedTechnology = pathname.match(/technology\/([a-zA-Z0-9\-]*)\//)
    return parsedTechnology ? parsedTechnology[1] : parsedTechnology
  }
  return null
}

const getFavoriteIdx = (favorites, url) => favorites.map(favorite => favorite.url).indexOf(url)

export const getFavoriteByUrl = (favorites, url) => {
  const idx = getFavoriteIdx(favorites, url)
  if (idx !== -1) {
    return favorites[idx]
  }
  return {}
}

export const updateFavorites = (favorites, newFavorite) => {
  const { url } = newFavorite
  const idx = getFavoriteIdx(favorites, url)
  if (idx === -1) {
    favorites.push(newFavorite)
  } else {
    favorites[idx] = newFavorite
  }
}

export const getStartIdx = (archiveData, start, end, column, value) => (
  (Number.isInteger(start) && Number.isInteger(end)) ? archiveData[column].slice(start, end).indexOf(value) + start
    : archiveData[column].indexOf(value)
)

export const getEndIdx = (archiveData, start, end, column, value) => (
  (Number.isInteger(start) && Number.isInteger(end)) ? archiveData[column].slice(start, end).lastIndexOf(value) + start + 1
    : archiveData[column].lastIndexOf(value) + 1
)

export const filterArchiveData = (
  archiveData,
  segment,
  segmentColumn,
  source,
  sourceColumn,
  tableName,
  tableNameColumn
) => {
  let start = 0
  let end
  if (source !== undefined && sourceColumn !== undefined) {
    start = getStartIdx(archiveData, start, end, sourceColumn, source)
    end = getEndIdx(archiveData, start, end, sourceColumn, source)
  }
  if (segment !== undefined && segmentColumn in archiveData) {
    start = getStartIdx(archiveData, start, end, segmentColumn, segment)
    end = getEndIdx(archiveData, start, end, segmentColumn, segment)
  }
  if (tableName !== undefined && tableNameColumn in archiveData) {
    start = getStartIdx(archiveData, start, end, tableNameColumn, tableName)
    end = getEndIdx(archiveData, start, end, tableNameColumn, tableName)
  }
  return [start, end]
}

export const formatTimeStamp = (timeStamp) => {
  if (!isNaN(Number(timeStamp))) return timeStamp
  let [year, day, time, zone] = timeStamp.split('-')
  if (zone && zone.length === 4) {
    zone = `${zone.slice(0, 2)}:${zone.slice(2)}`
    return Date.parse(timeStamp.split(' ').join('T').slice(0, timeStamp.length - 4) + zone)
  }
  return Date.parse(timeStamp.split(' ').join('T'))
}

export const formatDateStamp = (timeStamp) => {
  let epochTime = Date.parse(timeStamp.split(' ').join('T'))
  let fullDaysSinceEpoch = Math.floor(epochTime / 8.64e7)
  return fullDaysSinceEpoch
}

export const isValidUUID = uuid => uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i)

export const sortedByKey = (obj) => {
  const sortedObj = {}
  Object.keys(obj).sort().forEach((key) => {
    sortedObj[key] = obj[key]
  })
  return sortedObj
}

// temporary solution to filter out technologies that bypass KLP processing, i.e. ZAXIS
export const filterProcessedTechnologies = technologies => technologies.filter(tech => !Constants.NO_PROCESSING.includes(tech) || tech === 'AWD')

export const getTechnologiesToShow = technologyPreferences => (
  Object.keys(technologyPreferences).filter(technology => technologyPreferences[technology])
)

export const reverseOperator = (operator) => {
  switch (operator) {
    case '<':
      return '>'
    case '>':
      return '<'
    default:
      return operator
  }
}

export const getCriteriaColor = (rawValue, criteria) => {
  if (isNaN(Number(rawValue))) return ''
  const value = Math.abs(Number(rawValue))
  const { target, nte, operator } = criteria
  const compare = Constants.COMPARE[operator]
  if (target && nte) {
    switch (true) {
      case compare(target, value) || Number(target) === Number(value):
        return 'green'
      case compare(nte, value) || Number(nte) === Number(value):
        return 'yellow'
      default:
        return 'red'
    }
  } else if (target) {
    switch (true) {
      case compare(target, value) || Number(target) === Number(value):
        return 'green'
      default:
        return 'red'
    }
  }
  return ''
}

export const getPlacementType = (placement) => {
  if (placement.toUpperCase().includes('WIND')
    || placement.toUpperCase().includes('CUP')
    || placement.toUpperCase().includes('TABLE')
  ) {
    return 'mounted'
  }
  return 'unmounted'
}

export const getIndices = (data, prevIndices, columnName, target) => {
  if (!(columnName in data)) {
    return []
  }
  const newIndices = []
  prevIndices.forEach((index) => {
    const value = data[columnName][index]
    if (value === target) {
      newIndices.push(index)
    }
  })
  return newIndices
}

export const getUrlQueryParams = (urlQuery, paramNames) => {
  const queryParams = {}
  paramNames.forEach((name) => {
    const paramValue = urlQuery.get(name)
    if (paramValue !== null) queryParams[name] = paramValue
  })
  return queryParams
}

export const getTableData = (archiveData, columns, numRows) => {
  const tableData = []
  _.range(numRows).forEach((idx) => {
    const tableRow = []
    columns.forEach((column) => {
      const tableEntry = archiveData[column][idx]
      if (tableEntry !== undefined) tableRow.push(tableEntry)
    })
    if (tableRow.length > 0) tableData.push(tableRow)
  })
  return tableData
}

export const getTestNamePrefix = (testName, name) => {
  let [prefix] = testName.split('-')
  if (prefix === testName) [prefix] = testName.split('_')
  prefix = prefix.trim()
  if (!name.includes(prefix)) {
    if (name) return ` / ${prefix}`
    return prefix
  }
  return ''
}

export const addTags = (uuid, tags = []) => {
  const url = `${Constants.FIELDTEST_ARCHIVE_SHARED_API + uuid}/add_tags/`
  sendToServer(url, { tags }, 'POST')
}

export const removeTags = (uuid, tags = []) => {
  const url = `${Constants.FIELDTEST_ARCHIVE_SHARED_API + uuid}/remove_tags/`
  sendToServer(url, { tags }, 'POST')
}
export const capitalizeFirstLetter = (str) => { return str.charAt(0).toUpperCase() + str.slice(1) }