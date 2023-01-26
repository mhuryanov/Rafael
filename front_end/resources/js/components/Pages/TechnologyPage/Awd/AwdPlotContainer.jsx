/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Button } from '@dx/continuum-button'

import { useFetchArchiveData } from '../../../../hooks/fetchData'
import { getTableData, isEmpty, setDefaultObject, addToObject } from '../../../../utilities/helpers'
import { ARCHIVE_REPORTING_LOGS, COMPARE } from '../../../../utilities/constants'
import { BUILD_TRAIN_MAPPING, MAP, DATES, COUNT } from './constants'
import Box from '../../../Box'
import { FilterNoneRounded } from '@material-ui/icons'

const AwdPlot = lazy(() => import('./AwdPlot'))

const _ = require('underscore')

const TOTAL_COUNT = 'Total Count'
const IGNORED_COLUMNS = ['archive_uuid', 'row_index']
const MAX_COUNT_STACK = 50
const ARCHIVE_ID = 'id'
const ARCHIVE_WEEK_ID = 'fieldtest'


const addCountToObject = (obj, key, count) => {
  if (key in obj) {
    obj[key] += count
  } else {
    obj[key] = count
  }
}

const createCombinedKey = (keys, row, columnNames) => (
  keys.reduce((acc, key) => {
    const val = row[columnNames.indexOf(key)]
    return acc ? `${acc}&${val}` : `${val}`
  }, '')
)


export const applyFilters = (data, columnNames, filters) => {
  const validFilters = filters.filter(filter => filter.key && filter.operation && !isEmpty(filter.values))
  // TODO add logic to determine when to use raw data vs already filtered data based on how the filters were changed
  const filteredData = data.filter((row, i) => validFilters.reduce((acc, filter) => {
      const tableVal = row[columnNames.indexOf(filter.key)]
      if (filter.operation === "!=") {
        return acc && filter.values.reduce((acc2, value) => acc2 && COMPARE[filter.operation](tableVal, value), true)
      } else {
        return acc && filter.values.reduce((acc2, value) => acc2 || COMPARE[filter.operation](tableVal, value), false)
      }
    }, true)
  )
  return filteredData
}

export const applyProcessing = (filteredData, columnNames, plotType, categories, subCategories, sortBy, sortDirection, maxXTicks) => {
  if (categories.length === 0) return {}
  let processedData = {}
  filteredData.forEach((row, i) => {
    const categoryKey = createCombinedKey(categories, row, columnNames)
    const count = row[columnNames.indexOf(COUNT)]
    setDefaultObject(processedData, categoryKey)
    if (subCategories.length > 0) {
      const subCategoryKey = createCombinedKey(subCategories, row, columnNames)
      addCountToObject(processedData[categoryKey], subCategoryKey, count)
    }
    addCountToObject(processedData[categoryKey], TOTAL_COUNT, count)
  })
  if (plotType !== MAP) {
    Object.entries(processedData).forEach(([categoryKey, categoryData]) => {
      if (Object.keys(categoryData).length > MAX_COUNT_STACK) {
        const subCategoryKeys = Object.keys(categoryData).sort((a, b) => categoryData[a] < categoryData[b] ? 1 : -1)
        const topSubCategoryKeys = subCategoryKeys.slice(0, MAX_COUNT_STACK)
        const rest = subCategoryKeys.slice(MAX_COUNT_STACK).reduce((acc, subCategory) => acc + categoryData[subCategory], 0)
        const newCategoryData = {}
        topSubCategoryKeys.forEach((subCategory) => {
          newCategoryData[subCategory] = categoryData[subCategory]
        })
        newCategoryData.rest = rest
        processedData[categoryKey] = newCategoryData
      }
    })
  } else {
    return processedData
  }
  const sortedData = {}
  if (sortBy === COUNT) {
    const sortedKeys = Object.keys(processedData).sort((a, b) => (
      COMPARE[sortDirection](processedData[a][TOTAL_COUNT], processedData[b][TOTAL_COUNT])
    ) ? 1 : -1)
    sortedKeys.slice(0, maxXTicks > 0 ? maxXTicks : undefined).forEach((key) => {
      sortedData[key] = processedData[key]
    })
  } else if (categories.includes(sortBy)) {
    const sortedKeys = Object.keys(processedData).sort((a, b) => {
      const categoryIndex = categories.indexOf(sortBy)
      return COMPARE[sortDirection](a.split('&')[categoryIndex], b.split('&')[categoryIndex]) ? 1 : -1
    })
    sortedKeys.slice(0, maxXTicks > 0 ? maxXTicks : undefined).forEach((key) => {
      sortedData[key] = processedData[key]
    })
  }
  return isEmpty(sortedData) ? processedData : sortedData
}

export const getColumnMapping = (tableInfo) => {
  if (isEmpty(tableInfo)) return {}
  const columnMapping = {}
  tableInfo.columns
    .filter(column => !IGNORED_COLUMNS.includes(column.column_name))
    .sort((a, b) => a.column_name < b.column_name ? 1 : -1)
    .forEach((column) => {
    const { column_name, column_type } = column
    columnMapping[column_name] = column_type
  })
  return columnMapping
}

const formatBuildTrains = (buildTrains, platforms) => (
  buildTrains.map((train, i) => {
    if (train.match(/\d{2}[a-zA-Z]\d*/)) {
      const platform = platforms[i].toUpperCase()
      const formattedBuildTrain = BUILD_TRAIN_MAPPING[platform][Number(train.substring(0, 2))]
      const trainLetter = train[2] === 'A' ? '' : train[2] // skip version A
      if (train.match(/\d{2}[a-zA-Z]\d+/)) {
        return formattedBuildTrain ? formattedBuildTrain + trainLetter + 'Seed' : train
      }
      return formattedBuildTrain ? formattedBuildTrain + trainLetter : train
    }
    return train
  })
)


const AwdPlotContainer = ({
  archives,
  feature,
  defaultPlot,
  setNavContent,
  isWeekBased
}) => {
  const archiveKey = isWeekBased ? ARCHIVE_WEEK_ID : ARCHIVE_ID
  const [plot, setPlot] = useState(defaultPlot)
  const { settings, tableInfo, name } = plot
  const archiveIds = _.uniq(archives.map(archive => archive[archiveKey]))
  const columnMapping = getColumnMapping(tableInfo)
  const columnNames = Object.keys(columnMapping).concat(DATES)
  const [data, setData] = useState([])
  const [uniqueValues, setUniqueValues] = useState({})
  const [isLoadingData, fetchedData] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, !isEmpty(tableInfo) ? tableInfo.log_name : '', Object.keys(columnMapping), [], true)
  const [isProcessing, setIsProcessing] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const {
    plotType,
    filters,
    categories,
    subCategories,
    sortBy = COUNT,
    maxXTicks,
    sortDirection = '<'
  } = settings

  useEffect(() => {
    if (!isLoadingData) {
      const newData = []
      const newUniqueValues = {}
      Object.entries(fetchedData).forEach(([archiveId, archiveData]) => {
        if (typeof archiveData === 'object' && !isEmpty(archiveData)) {
          const numRows = archiveData[COUNT].length
          const archive = _.find(archives, archive => archive[archiveKey] === archiveId)
          const dates = isWeekBased ? _.range(numRows).map(() => archive.test_date) : _.range(numRows).map(() => archive.date)
          if ('build_train' in archiveData && 'platform' in archiveData) {
            const formattedBuildTrains = formatBuildTrains(archiveData.build_train, archiveData.platform)
            archiveData.build_train = formattedBuildTrains
          }
          Object.keys(columnMapping).forEach((columnName) => {
            if (columnMapping[columnName] === 'Text') {
              addToObject(newUniqueValues, columnName, archiveData[columnName])
            }
          }) 
          newData.push(getTableData({ ...archiveData, dates }, columnNames, numRows))
        }
      })
      Object.entries(newUniqueValues).forEach(([columnName, values]) => {
        newUniqueValues[columnName] = _.uniq(values)
      })
      setUniqueValues(newUniqueValues)
      setData(newData.flat())
    }
  }, [isLoadingData, fetchedData])

  useEffect(() => {
    if (data.length > 0) {
      setPlot((prevPlot) => {
        const newFilteredData = applyFilters(data, columnNames, filters)
        const newProcessedData = applyProcessing(newFilteredData, columnNames, plotType, categories, subCategories, sortBy, sortDirection, maxXTicks)
        return {
          ...prevPlot,
          data: newProcessedData
        }
      })
    }
    if (!isLoadingData) setIsProcessing(false)
  }, [data, isLoadingData, settings])

  useEffect(() => {
    if (isEmpty(defaultPlot.settings)) {
      handleEditPlot()
    }
  }, [defaultPlot])

  const handleExpandPlot = () => {
    setIsExpanded(prevIsExpanded => !prevIsExpanded)
  }

  const handleEditPlot = () => {
    setNavContent({
      feature,
      plot,
      setPlot,
      tableInfo,
      uniqueValues
    })
  }

  console.log('rendering AwdPlotContainer')
  return (
    <>
    <Box
      title={
        <>
          {name}
          <div>
            <Button disabled={isProcessing} size="small" onClick={handleEditPlot}>Edit</Button>
            <Button disabled={isProcessing} size="small" onClick={handleExpandPlot}>{isExpanded ? 'Minimize': 'Expand'}</Button>
          </div>
        </>
      }
      type={`awd-plot ${isExpanded ? 'expanded-awd-plot' : ''}`}
      isLoading={isProcessing || isLoadingData}
    >
      <>
        <AwdPlot plot={plot} />
      </>
    </Box>
    </>
  )
}

export default React.memo(AwdPlotContainer)
