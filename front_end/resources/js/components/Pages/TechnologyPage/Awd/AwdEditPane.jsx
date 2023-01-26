/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Button } from '@dx/continuum-button'
import { Input } from '@tidbits/react-tidbits';
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'

import { isEmpty } from '../../../../utilities/helpers'
import { COMPARE } from '../../../../utilities/constants'
import { PLOT_TYPES, MAP, BAR, DATES, COUNT } from './constants'
import { Checkbox } from '@dx/continuum-checkbox';
import { getColumnMapping } from './AwdPlotContainer' 


const _ = require('underscore')

const technology = 'AWD'
const DEFAULT_SETTINGS = {
  logName: '',
  plotType: '',
  filters: [],
  categories: [],
  subCategories: [],
  sortDirection: '<',
  sortBy: COUNT,
  plotCdf: false,
  showPdfValues: false,
  options: {},
  maxXTicks: -1,
} 


const AwdEditOption = ({ title, children }) => {
  return (
    <div style={{ marginTop: '10px', marginBottom: '10px' }}>
      <div>{title}</div>
      {children}
    </div>
  )
}


export const AwdEditPane = ({ feature, plot, setPlot, fetchedTables, uniqueValues, handleCancel }) => {
  const [tableInfo, setTableInfo] = useState({})
  const columnMapping = getColumnMapping(tableInfo)
  const columnNames = Object.keys(columnMapping).concat(DATES)
  const [title, setTitle] = useState(plot.name)
  const { settings } = plot
  const [plotSettings, setPlotSettings] = useState(!isEmpty(settings) ? settings : DEFAULT_SETTINGS)
  const {
    logName,
    plotType,
    filters,
    categories,
    subCategories,
    plotCdf,
    showPdfValues,
    maxXTicks,
  } = plotSettings

  useEffect(() => {
    if (!isEmpty(fetchedTables) && isEmpty(tableInfo)) {
      setTableInfo(_.find(fetchedTables, t => t.log_name === logName))
    }
  }, [fetchedTables])

  const handleSubmit = () => {
    setPlot((prevPlot) => {
      return {
        ...prevPlot,
        tableInfo,
        settings: plotSettings,
        name: title
      }
    })
  }

  const handleTitle = (e) => {
    const { value } = e.target
    setTitle(value)
  }

  const handleMaxXTicks = (e) => {
    const { value } = e.target
    setPlotSettings(prevPlotSettings => ({
      ...prevPlotSettings,
      maxXTicks: value
    }))
  }

  const handleSelectTable = (option) => {
    const { value } = option
    setPlotSettings({
      ...DEFAULT_SETTINGS,
      logName: value,
      plotType: value.includes('_map') ? MAP : BAR
    })
    setTableInfo(_.find(fetchedTables, table => table.log_name === value))
  }

  const handleSelectPlotType = (option) => {
    const { value } = option
    setPlotSettings(prevPlotSettings => ({
      ...prevPlotSettings,
      plotType: value
    }))
  }

  const handleAddFilter = () => {
    setPlotSettings((prevPlotSettings) => {
      const { filters: newFilters } = JSON.parse(JSON.stringify(prevPlotSettings))
      return {
        ...prevPlotSettings,
        filters: newFilters.concat({ key: '', operation: '', values: [] })
      }
    })
  }

  const handleRemoveFilterKey = (key) => {
    setPlotSettings((prevPlotSettings) => {
      const { filters: prevFilters } = JSON.parse(JSON.stringify(prevPlotSettings))
      const selectedFilter = _.find(prevFilters, filter => filter.key === key)
      const newFilters = _.without(prevFilters, selectedFilter)
      return {
        ...prevPlotSettings,
        filters: newFilters
      }
    })
  }

  const handleSelectFilterKey = (option, key) => {
    const { value } = option
    setPlotSettings((prevPlotSettings) => {
      const { filters: newFilters } = JSON.parse(JSON.stringify(prevPlotSettings))
      const selectedFilter = _.find(newFilters, filter => filter.key === key)
      selectedFilter.key = value
      if (columnMapping[value] === 'Text') selectedFilter.operation = '='
      return {
        ...prevPlotSettings,
        filters: newFilters
      }
    })
  }

  const handleSelectFilterOperation = (option, key) => {
    const { value } = option
    setPlotSettings((prevPlotSettings) => {
      const { filters: newFilters } = JSON.parse(JSON.stringify(prevPlotSettings))
      const selectedFilter = _.find(newFilters, filter => filter.key === key)
      selectedFilter.operation = value
      return {
        ...prevPlotSettings,
        filters: newFilters
      }
    })
  }

  const handleSelectFilterValues = (options, key) => {
    const values = options ? options.map(option => option.value) : []
    setPlotSettings((prevPlotSettings) => {
      const { filters: newFilters } = JSON.parse(JSON.stringify(prevPlotSettings))
      const selectedFilter = _.find(newFilters, filter => filter.key === key)
      selectedFilter.values = values
      return {
        ...prevPlotSettings,
        filters: newFilters
      }
    })
  }

  const handleSelectCategory = (options) => {
    const values = options ? options.map(option => option.value) : []
    const nonTextValues = values.filter(value => columnMapping[value] !== 'Text')
    const newCategories = (
      nonTextValues.length > 0 && plotType !== MAP
        ? [nonTextValues[0]]
        : values
    )
    setPlotSettings(prevPlotSettings => ({
      ...prevPlotSettings,
      categories: newCategories
    }))
  }

  const handleSelectSubCategory = (options) => {
    const values = options ? options.map(option => option.value) : []
    setPlotSettings(prevPlotSettings => ({
      ...prevPlotSettings,
      subCategories: values
    }))
  }

  const handlePlotCdf = () => {
    setPlotSettings(prevPlotSettings => ({
      ...prevPlotSettings,
      plotCdf: !prevPlotSettings.plotCdf
    }))
  }

  const handleShowPdfValues = () => {
    setPlotSettings(prevPlotSettings => ({
      ...prevPlotSettings,
      showPdfValues: !prevPlotSettings.showPdfValues
    }))
  }

  const validTables = isEmpty(fetchedTables) ? [] : fetchedTables.filter(table => table.log_name.includes(`${technology.toLowerCase()}_${feature.toLowerCase()}`))
  const isIncomplete = !logName || (plotType === MAP && categories.length <= 1) || categories.length === 0

  return (
    <div>
      <AwdEditOption title="Plot Title">
        <Input.Text type="text" onChange={handleTitle} placeholder="Enter title of plot..." defaultValue={title} />
      </AwdEditOption>
      <AwdEditOption title="Select Table">
        <Select
          onChange={handleSelectTable}
          value={{ label: logName, value: logName }}
          options={validTables.map(table => ({ label: table.log_name, value: table.log_name }))}
        />
      </AwdEditOption>
      <AwdEditOption title="Plot Type">
        <Select
          isDisabled={!logName}
          onChange={handleSelectPlotType}
          value={{ label: plotType, value: plotType }}
          options={
            logName && logName.includes('_map')
              ? [{ label: MAP, value: MAP }]
              : PLOT_TYPES.map(plotType => ({ label: plotType, value: plotType }))
          }
        />
      </AwdEditOption>
      <AwdEditOption title="Filters">
        <Button disabled={!logName} onClick={handleAddFilter}>Add Filters</Button>
        {filters.map(filter => (
          <div key={filter.key} style={{ marginTop: '20px' }}>
            <Select
              onChange={(option) => handleSelectFilterKey(option, filter.key)}
              value={{ label: filter.key, value: filter.key }}
              options={columnNames.map(columnName => ({ label: columnName, value: columnName }))}
            />
            <Select
              isDisabled={!filter.key}
              onChange={(option) => handleSelectFilterOperation(option, filter.key)}
              value={{ label: filter.operation, value: filter.operation }}
              options={Object.keys(COMPARE).map(operation => ({ label: operation, value: operation }))}
            />
            <CreatableSelect
              isDisabled={!filter.operation || !filter.key}
              isMulti
              onChange={(option) => handleSelectFilterValues(option, filter.key)}
              value={filter.values.map(value => ({ label: value, value }))}
              options={uniqueValues[filter.key] && uniqueValues[filter.key].map(value => ({ label: value, value }))}
            />
            <Button onClick={() => handleRemoveFilterKey(filter.key)}>Remove</Button>
          </div>
        ))}
      </AwdEditOption>
      <AwdEditOption title={plotType === MAP ? 'Lat/Lng Coordinates' : 'X-Axis'}>
        <Select
          isMulti
          isDisabled={!logName}
          onChange={handleSelectCategory}
          value={categories.map(category => ({ label: category, value: category }))}
          options={(
            plotType === MAP
              ? columnNames.filter(columnName => columnName.includes('latitude') || columnName.includes('longitude')).map(columnName => ({ label: columnName, value: columnName }))
              : _.without(columnNames, COUNT).map(columnName => ({ label: columnName, value: columnName }))
          )}
        />
      </AwdEditOption>
      <AwdEditOption title="Breakdown">
        <Select
          isMulti
          isDisabled={isIncomplete}
          onChange={handleSelectSubCategory}
          value={subCategories.map(subCategory => ({ label: subCategory, value: subCategory }))}
          options={_.without(columnNames, COUNT, ...categories).map(columnName => ({ label: columnName, value: columnName }))}
        />
      </AwdEditOption>
      {plotType !== MAP && (
        <>
          <Checkbox checked={plotCdf} onChecked={handlePlotCdf}>
            Plot CDF
          </Checkbox>
          <Checkbox checked={showPdfValues} onChecked={handleShowPdfValues}>
            Show PDF Values
          </Checkbox>
        </>
      )}
      <AwdEditOption title="Max X Axis Ticks">
        <Input.Text type="number" onChange={handleMaxXTicks} placeholder="max number of x ticks" defaultValue={maxXTicks} />
      </AwdEditOption>
      <Button disabled={isIncomplete} onClick={handleSubmit}>Apply Changes</Button>
      <Button onClick={handleCancel}>Cancel</Button>
    </div>
  )
}

export default React.memo(AwdEditPane)
