import _ from 'lodash';

/**
 * Filters out data based on row limit and then sorts the remainder using
 * a sort key and specified sort order
 * 
 * @param {Array} data an array of objects [{ key: value }, ...]
 * @param {number} rowLimit number of rows to keep
 * @param {String[]} sortKeys keys to use for sorting
 * @param {String[]} sortOrder asc or desc
 * @returns 
 */
export function FilterData(data, rowLimit, sortKeys, sortOrder) {
  // Filters data based on row count and sorts it based on a key
  return _.chain(data).orderBy(sortKeys, sortOrder).take(rowLimit).value()
}

/**
 * Transforms the data returned by the Cassandra endpoint to a list of objects. The endpoint returns data 
 * in nested objects but different components of front-end work best with list of objects
 * 
 * @param {Object} logData an object containing archive uuids as key and {column_name: [...]} as value
 * @returns {Array} an array of objects [{ column_name: ... }, ...]
 */
export function TransformCassandraData(logData) {
  let rows = []
  let lastRowIndex = 0

  for (const archiveUuid in logData) {
    const currentArchive = logData[archiveUuid]
    const randomKey = Object.keys(currentArchive)[0]
    const valueArrayLength = currentArchive[randomKey].length

    for (let i = 0; i < valueArrayLength; i++) {
      rows.push({})
    }

    for (const key in currentArchive) {
      for (let i = 0; i < valueArrayLength; i++) {
        const archive_value = currentArchive[key][i]
        rows[i + lastRowIndex][key] = archive_value
      }
    }
    lastRowIndex = rows.length
  }

  return rows
}
