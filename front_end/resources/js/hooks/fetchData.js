/* eslint-disable no-console */
import { useState, useEffect } from 'react'
import { rafaelFetch, sendToServer, addToObject } from '../utilities/helpers'

const queryString = require('query-string')
const shortid = require('shortid')


export const useFetchRafael = (fetchInfo, dependencies = []) => {
  const [state, setState] = useState({
    loading: true,
    data: {}
  })
  const { url, data, method } = fetchInfo
  const dataString = JSON.stringify(data)

  const init = async () => {
    setState(prevState => ({
      ...prevState,
      loading: true
    }))
  }

  useEffect(() => {
    const fetchData = async () => {
      await init()
      if (url === '') {
        setState({
          loading: false,
          data: {}
        })
      } else {
        sendToServer(url, (data === undefined) ? {} : data, (method === undefined) ? 'GET' : method, (responseJson) => {
          setState({
            loading: false,
            data: responseJson || {}
          })
        }, (errorMessage) => { setState({ loading: false, data: { errorMessage } }) })
      }
    }
    fetchData()
  }, [url, dataString, method, ...dependencies])

  return [state.loading, state.data]
}

export const useFetchRafaelMulti = (fetchInfoList, dependencies = []) => {
  const [state, setState] = useState({
    loading: true,
    data: {}
  })

  const init = async () => {
    setState(prevState => ({
      ...prevState,
      loading: true
    }))
  }

  const raiseError = (errorMessage) => {
    setState({
      loading: false,
      data: { errorMessage }
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      await init()
      const rafaelPromises = fetchInfoList.map((fetchInfo) => {
        const { url, data = {}, method = 'GET' } = fetchInfo
        console.log(`Sending Http request to URL: ${url}`)
        return rafaelFetch(url, data, method)
      })
      try {
        const rafaelResponses = await Promise.all(rafaelPromises)
        const fetchedData = await Promise.all(rafaelResponses.map(response => response.json()))
        setState({
          loading: false,
          data: fetchedData
        })
      } catch (err) {
        const errorMessage = `ERROR: ${err.message}`
        raiseError(errorMessage)
      }
    }
    fetchData()
  }, [...dependencies])

  return [state.loading, state.data]
}

export const useFetchArchiveData = (
  archiveIds, baseUrl, logName, columns = [], dependencies = [], ignoreCache = false, enablePartialLoading = false, addConditions = ""
) => {
  const CONCURRENCY = 50
  let allArchiveData = {}
  const archiveIdsString = [...archiveIds].sort().join('')
  const columnsString = columns.filter(e => e != null).sort().join('')
  const [state, setState] = useState({
    loading: true,
    data: {}
  })

  const init = async () => {
    allArchiveData = {}
    setState(prevState => ({
      ...prevState,
      loading: true
    }))
  }

  const partialLoad = (partialData) => {
    setState({
      loading: shortid.generate(), // gives us a way to check for changes
      data: partialData
    })
  }

  const finishPartialLoad = () => {
    setState({
      loading: false,
      data: {}
    })
  }

  const finish = async () => {
    setState({
      loading: false,
      data: allArchiveData
    })
  }

  const raiseError = async (errorMessage) => {
    setState({
      loading: false,
      data: { errorMessage }
    })
  }

  const getFromCache = (archiveId) => {
    if (ignoreCache) return null
    const queryUrl = `${baseUrl + archiveId}/${logName}?${addConditions}`
    return sessionStorage.getItem(queryUrl)
  }

  const setToCache = (archiveId, data) => {
    if (!ignoreCache) {
      const queryUrl = `${baseUrl + archiveId}/${logName}?${addConditions}`
      sessionStorage.setItem(queryUrl, JSON.stringify(data))
    }
  }

  useEffect(() => {
    let isCanceled = false // Flag to know when component is mounted/unmounted

    const fetchArchivesByPage = async (archivesToFetch) => {
      const rafaelPromises = archivesToFetch.map((archive) => {
        const { id: archiveId, page } = archive
        const validColumns = columns.filter(e => e != null)
        const columnsQuery = (validColumns.length === 0) ? {} : { validColumns: validColumns.join(',') }
        const columnUrl = queryString.stringifyUrl({ url: `${baseUrl + archiveId}/${logName}`, query: columnsQuery })
        const addConditionsQuery = (addConditions === "") ? {} : { query_string: addConditions }
        const addUrl = queryString.stringifyUrl({ url: columnUrl, query: addConditionsQuery })
        const query = (page === null) ? {} : { page }
        const url = queryString.stringifyUrl({ url: addUrl, query })
        console.log(`Sending Http request to URL: ${url}`)
        return rafaelFetch(url, {}, 'GET')
      })
      try {
        const rafaelResponses = await Promise.all(rafaelPromises)
        const fetchedArchives = await Promise.all(rafaelResponses.map((response) => {
          if (!response.ok) {
            const errorMessage = `ERROR: Failed to call ${response.url}.`
            const archiveId = errorMessage.match(new RegExp(`(?:${baseUrl})(.+)(?=\/${logName})`))[1]
            setToCache(archiveId, errorMessage)
            return errorMessage
          }
          return response.json()
        }))
        const partialData = {}
        const getRemainingArchives = () => {
          const remainingArchivesToFetch = []
          fetchedArchives.forEach((archive, i) => {
            if (typeof archive === 'object' && !('error' in archive) && !('detail' in archive)) {
              const { id: archiveId } = archivesToFetch[i]
              const { page, data: archiveData } = archive
              if (archiveId in allArchiveData) {
                Object.keys(archiveData).forEach((colName) => {
                  addToObject(allArchiveData[archiveId], colName, archiveData[colName])
                })
              } else {
                allArchiveData[archiveId] = archiveData
              }
              if (enablePartialLoading) {
                partialData[archiveId] = archiveData
              }
              if (page !== null) {
                remainingArchivesToFetch.push({ id: archiveId, page })
              }
            }
          })
          return remainingArchivesToFetch
        }
        const remainingArchivesToFetch = getRemainingArchives()
        if (enablePartialLoading) partialLoad(partialData)
        if (!isCanceled && remainingArchivesToFetch.length !== 0) {
          return fetchArchivesByPage(remainingArchivesToFetch)
        } else if (!isCanceled) {
          Object.keys(allArchiveData).forEach(archiveId => setToCache(archiveId, allArchiveData[archiveId]))
        }
      } catch (err) {
        const errorMessage = `ERROR: ${err.message}`
        raiseError(errorMessage)
        return false
      }
      return true
    }

    const fetchArchiveData = async () => {
      try {
        await init()
        if (!logName) {
          raiseError('Please use valid log name')
          return
        }
        const archivesToFetch = archiveIds
          .map(archiveId => ({ id: archiveId, page: null }))
          .filter((archive) => {
            const archiveId = archive.id
            const cachedResult = getFromCache(archiveId)
            if (cachedResult && !cachedResult.includes('ERROR')) {
              allArchiveData[archiveId] = JSON.parse(cachedResult)
            } else if (cachedResult) {
              console.log(`Retrieved cached error for ${archiveId}`)
              return false
            }
            return cachedResult === null
          })
        if (archivesToFetch.length === 0) {
          finish()
        } else {
          for (let i = 0; i < archivesToFetch.length; i += CONCURRENCY) {
            const next = (i + CONCURRENCY <= archivesToFetch.length) ? i + CONCURRENCY : archivesToFetch.length
            const success = await fetchArchivesByPage(archivesToFetch.slice(i, next))
            if (!success || isCanceled) break
          }
          if (enablePartialLoading) {
            finishPartialLoad()
          } else {
            finish()
          }
        }
      } catch (err) {
        raiseError(err.message)
      }
    }

    fetchArchiveData()
    return () => {
      isCanceled = true
    }
  }, [archiveIdsString, baseUrl, logName, columnsString, ...dependencies])

  return [state.loading, state.data]
}

export const useFetchArchiveDataQuery = (
  archiveIds, baseUrl, primary_key, primary_key_value, logName, addConditions = '', columns = [], dependencies = [], ignoreCache = false, enablePartialLoading = false
) => {
  const CONCURRENCY = 50
  let allArchiveData = {}
  const archiveIdsString = [...archiveIds].sort().join('')
  const columnsString = [...columns].sort().join('')
  const [state, setState] = useState({
    loading: true,
    data: {}
  })

  const init = async () => {
    allArchiveData = {}
    setState(prevState => ({
      ...prevState,
      loading: true
    }))
  }

  const partialLoad = (partialData) => {
    setState({
      loading: shortid.generate(), // gives us a way to check for changes
      data: partialData
    })
  }

  const finishPartialLoad = () => {
    setState({
      loading: false,
      data: {}
    })
  }

  const finish = async () => {
    setState({
      loading: false,
      data: allArchiveData
    })
  }

  const raiseError = async (errorMessage) => {
    setState({
      loading: false,
      data: { errorMessage }
    })
  }

  const getFromCache = (archiveId) => {
    if (ignoreCache) return null
    const queryUrl = `${baseUrl + primary_key}/${primary_key_value}/${logName} with conditions: ${addConditions}}`
    return sessionStorage.getItem(queryUrl)
  }

  const setToCache = (archiveId, data) => {
    if (!ignoreCache) {
      const queryUrl = `${baseUrl + primary_key}/${primary_key_value}/${logName} with conditions: ${addConditions}}`
      sessionStorage.setItem(queryUrl, JSON.stringify(data))
    }
  }

  useEffect(() => {
    let isCanceled = false // Flag to know when component is mounted/unmounted

    const fetchArchivesByPage = async (archivesToFetch) => {
      const rafaelPromises = archivesToFetch.map((archive) => {
        const { id: archiveId, page } = archive
        const columnsQuery = (columns.length === 0) ? {} : { columns: columns.join(',') }
        const columnUrl = queryString.stringifyUrl({ url: `${baseUrl + primary_key}/${primary_key_value}/${logName}`, query: columnsQuery })
        const addConditionsQuery = (addConditions === "") ? {} : { query_string: addConditions }
        const addUrl = queryString.stringifyUrl({ url: columnUrl, query: addConditionsQuery })
        const query = (page === null) ? {} : { page }
        const url = queryString.stringifyUrl({ url: addUrl, query })
        console.log(`Sending Http request to URL: ${url}`)
        const response = rafaelFetch(url, {}, 'GET')
        return response
      })
      try {
        const rafaelResponses = await Promise.all(rafaelPromises)
        const fetchedArchives = await Promise.all(rafaelResponses.map((response) => {
          if (!response.ok) {
            const errorMessage = `ERROR: Failed to call ${response.url}.`
            const archiveId = errorMessage.match(new RegExp(`(?:${baseUrl})(.+)(?=\/${primary_key})`))[1]
            setToCache(archiveId, errorMessage)
            return errorMessage
          }
          return response.json()
        }))
        const partialData = {}
        const getRemainingArchives = () => {
          const remainingArchivesToFetch = []
          fetchedArchives.forEach((archive, i) => {
            if (typeof archive === 'object' && !('error' in archive) && !('detail' in archive)) {
              const { id: archiveId } = archivesToFetch[i]
              const { page, data: archiveData } = archive
              if (archiveId in allArchiveData) {
                Object.keys(archiveData).forEach((colName) => {
                  addToObject(allArchiveData[archiveId], colName, archiveData[colName])
                })
              } else {
                allArchiveData[archiveId] = archiveData
              }
              if (enablePartialLoading) {
                partialData[archiveId] = archiveData
              }
              if (page !== null) {
                remainingArchivesToFetch.push({ id: archiveId, page })
              }
            }
          })
          return remainingArchivesToFetch
        }
        const remainingArchivesToFetch = getRemainingArchives()
        if (enablePartialLoading) partialLoad(partialData)
        if (!isCanceled && remainingArchivesToFetch.length !== 0) {
          return fetchArchivesByPage(remainingArchivesToFetch)
        } else if (!isCanceled) {
          Object.keys(allArchiveData).forEach(archiveId => setToCache(archiveId, allArchiveData[archiveId]))
        }
      } catch (err) {
        const errorMessage = `ERROR: ${err.message}`
        raiseError(errorMessage)
        return false
      }
      return true
    }

    const fetchArchiveData = async () => {
      try {
        await init()
        if (!logName) {
          raiseError('Please use valid log name')
          return
        }
        const archivesToFetch = archiveIds
          .map(archiveId => ({ id: archiveId, page: null }))
          .filter((archive) => {
            const archiveId = archive.id
            const cachedResult = getFromCache(archiveId)
            if (cachedResult && !cachedResult.includes('ERROR')) {
              allArchiveData[archiveId] = JSON.parse(cachedResult)
            } else if (cachedResult) {
              console.log(`Retrieved cached error for ${archiveId}`)
              return false
            }
            return cachedResult === null
          })
        if (archivesToFetch.length === 0) {
          finish()
        } else {
          for (let i = 0; i < archivesToFetch.length; i += CONCURRENCY) {
            const next = (i + CONCURRENCY <= archivesToFetch.length) ? i + CONCURRENCY : archivesToFetch.length
            const success = await fetchArchivesByPage(archivesToFetch.slice(i, next))
            if (!success || isCanceled) break
          }
          if (enablePartialLoading) {
            finishPartialLoad()
          } else {
            finish()
          }
        }
      } catch (err) {
        raiseError(err.message)
      }
    }

    fetchArchiveData()
    return () => {
      isCanceled = true
    }
  }, [archiveIdsString, baseUrl, primary_key, primary_key_value, logName, addConditions, columnsString, ...dependencies])

  return [state.loading, state.data]
}
