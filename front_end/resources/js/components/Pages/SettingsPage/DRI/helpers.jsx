import { TECHNOLOGY_INFO_API, USER_API, TABLE_API, TABLE_MAPPING_API } from '../../../../utilities/constants'
import { size, sendToServer } from '../../../../utilities/helpers'

export const DATA_TYPES = {
  FEATURE: 'name',
  PREDICATE: 'predicates',
  SEGMENT: 'segment_mapping'
}

export const getAllUrl = () => ({
  PREDICATE: `${TECHNOLOGY_INFO_API}all_predicates/`,
  ACCESS_CONTROL: `${USER_API}users_email/`
})

export const getFetchUrl = (technology, feature = '') => ({
  PREDICATE: `${TECHNOLOGY_INFO_API}${technology}/${feature}/info/`,
  SEGMENT: `${TECHNOLOGY_INFO_API}${technology}/${feature}/info`,
  ACCESS_CONTROL: `${TECHNOLOGY_INFO_API}${technology}/`,
  TABLE: `${TABLE_API}by_technology/${technology}/`,
  TABLE_MAPPING: `${TABLE_MAPPING_API}${technology}/`
})

export const getPatchUrl = (technology, feature = '') => ({
  FEATURE: `${TECHNOLOGY_INFO_API}${technology}/add_features/`,
  PREDICATE: `${TECHNOLOGY_INFO_API}${technology}/${feature}/predicates/`,
  SEGMENT: `${TECHNOLOGY_INFO_API}${technology}/${feature}/update_segment_mapping/`,
  ACCESS_CONTROL: `${TECHNOLOGY_INFO_API}${technology}/access_control/`,
  TABLE_MAPPING: `${TABLE_MAPPING_API}${technology}/`
})

export const getUpdateTableUrls = logName => ({
  PARTIAL: `${TABLE_API}${logName}/`,
  ADD_COLUMNS: `${TABLE_API}${logName}/add_columns/`,
  TECHNOLOGY: `${TABLE_API}${logName}/assign_technology/`,
  PRIMARY_KEYS: `${TABLE_API}${logName}/set_primary_keys/`
})

export const getUpdateTableMappingUrls = (technology, groupName) => ({
  DELETE: `${TABLE_MAPPING_API}${technology}/${groupName}/`,
  APPEND: `${TABLE_MAPPING_API}${technology}/${groupName}/append`
})

export const formatItems = (items, type) => {
  if (Array.isArray(items) && !(items[0] instanceof Object)) {
    return items
  }
  if (Array.isArray(items) && items[0] instanceof Object) {
    return items.map(item => item[DATA_TYPES[type]])
  }
  if (items instanceof Object) {
    return items[DATA_TYPES[type]] || []
  }
  return []
}

export const patchItems = (itemsToPatch, typeKey, technology, feature, callBack, errorCallBack, method = 'PATCH') => {
  if (Array.isArray(itemsToPatch) || itemsToPatch instanceof Object
    || (typeof itemsToPatch === 'string' && itemsToPatch.length > 0)
  ) {
    const url = getPatchUrl(technology, feature)[typeKey]
    let data = {}
    const dataType = DATA_TYPES[typeKey]
    if (dataType) data[dataType] = itemsToPatch
    else data = itemsToPatch
    sendToServer(url, data, method, callBack, errorCallBack)
  }
}

export const updateTable = (prevTable, newTable, callBack, errorCallBack) => {
  const {
    table_name: prevTableName,
    log_type: prevLogType,
    technology: prevTechnology,
    columns: prevColumns,
    primary_keys: prevPrimaryKeys
  } = prevTable
  const {
    log_name: newLogName,
    table_name: newTableName,
    log_type: newLogType,
    technology: newTechnology,
    columns: newColumns,
    primary_keys: newPrimaryKeys
  } = newTable

  const columnsToAdd = newColumns
    .filter(column => prevTable.table_name !== newTable.table_name || !prevColumns.map(pCol => pCol.column_name).includes(column.column_name))

  const patchData = (type, data, cb, errorCb, method = 'PATCH') => {
    const url = getUpdateTableUrls(newLogName)[type]
    if (type === 'PARTIAL' && (prevTableName === newTableName && prevLogType === newLogType)) {
      cb()
    } else if (type === 'TECHNOLOGY' && (prevTechnology === newTechnology || newLogType === 'SHARE_LOG')) {
      cb()
    } else if (type === 'ADD_COLUMNS' && columnsToAdd.length === 0) {
      cb()
    } else if (type === 'PRIMARY_KEYS' && JSON.stringify(prevPrimaryKeys) === JSON.stringify(newPrimaryKeys)) {
      cb()
    } else {
      console.log(`${method} Request to : ${url} with ${JSON.stringify(data)}`)
      sendToServer(url, data, method, cb, errorCb)
    }
  }

  patchData('PARTIAL', { table_name: newTableName, log_type: newLogType }, () => patchData(
    'TECHNOLOGY', { technology: newTechnology }, () => patchData(
      'ADD_COLUMNS', { columns: columnsToAdd }, () => patchData(
        'PRIMARY_KEYS', { primary_keys: newPrimaryKeys }, callBack, errorCallBack, 'POST'
      ), errorCallBack, 'POST'
    ), errorCallBack, 'POST'
  ), errorCallBack, 'PATCH')
}

export const createTable = (newTable, callBack, errorCallBack) => {
  const {
    log_name,
    table_name,
    keyspace,
    log_type,
    technology
  } = newTable
  const newTableToCreate = {
    log_name,
    table_name,
    keyspace,
    log_type,
    technology
  }
  console.log(newTableToCreate)
  const url = `${TABLE_API}`
  console.log(`POST Request to : ${url} with ${JSON.stringify(newTableToCreate)}`)
  sendToServer(url, newTableToCreate, 'POST', () => updateTable(
    { ...newTableToCreate, columns: [], primary_keys: [] }, newTable, callBack, errorCallBack
  ), errorCallBack)
}

export const updateTableGroup = (technology, prevTableGroup, newTableGroup, callBack, errorCallBack) => {
  const {
    log_names: prevLogNames
  } = prevTableGroup
  const {
    log_names: newLogNames,
    group_name: newGroupName
  } = newTableGroup

  const logNamesToAdd = newLogNames.filter(logName => !prevLogNames.includes(logName))
  const url = getUpdateTableMappingUrls(technology, newGroupName).APPEND
  sendToServer(url, { log_names: logNamesToAdd }, 'POST', callBack, errorCallBack)
}
