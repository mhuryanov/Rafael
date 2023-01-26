/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useState } from 'react'
import { StatePanel } from '@dx/continuum-state-panel'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import Table from '@tidbits/react-tidbits/Table'
import { Text, Link } from '@tidbits/react-tidbits'
import { Row } from 'react-bootstrap'
import { useFetchArchiveData } from '../../../hooks/fetchData'
import {
  addToObject,
  isEmpty,
  createArchiveLabels,
  filterArchiveData,
  setDefaultObject,
  isValidArchiveData,
} from '../../../utilities/helpers'
import { getSummaryInfo } from './helpers'
import { 
  ARCHIVE_REPORTING_LOGS, TTFF_TABLE_MAPPING, KPI_NAMES, DEFAULT_REPORT_TYPE, 
  CTP, PERFORMANCE, L5, NMEA, SAL3
} from '../../../utilities/constants'
import Filter from '../../Widgets/Filter'
import SummaryRow from './SummaryRow'
import SummaryTableLegend from './SummaryTableLegend'

const shortid = require('shortid')
const _ = require('underscore')


const ErrorMessage = () => (
  <StatePanel
    message="Error- could not find KPI summary data."
    suggestion="Data may still be processing."
  />
)

const getCategoryMapping = (
  technology,
  feature,
  archivesInfo,
  summaryInfo,
  filters,
  reportType,
) => {
  const { segmentColumn, sourceColumn, unitColumn, tableNameColumn, categoryColumn, kpiColumn } = summaryInfo
  const { customFilters = {} } = filters
  const { segment, source, table_name } = customFilters
  const categoryMapping = {}
  Object.values(archivesInfo).forEach((archiveData) => {
    if (!isEmpty(archiveData)) {
      let [start, end] = filterArchiveData(archiveData, segment, segmentColumn, source, sourceColumn, table_name, tableNameColumn)
      if (['General','MAPS377'].includes(table_name) && reportType === CTP && technology === 'GNSS' && end === 0){
        // 2021-08-13 CTP table add new column for grouping. Old data will be set to 'null'.
        //  Add a special processing if CTP General return empty, use 'null' to filter again
        [start, end] = filterArchiveData(archiveData, segment, segmentColumn, source, sourceColumn, 'null', tableNameColumn)
      }
      if (start < 0) {
        return
      }
      const categories = archiveData[categoryColumn].slice(start, end)
      // special case for TTFF until order is fixed on KPI library side
      const selectedCategories = technology === 'GNSS' && feature === 'TTFF' && reportType !== NMEA ? TTFF_TABLE_MAPPING[table_name] : _.uniq(categories)
      selectedCategories.forEach((selectedCategory) => {
        categories.forEach((category, categoryIdx) => {
          if (category === selectedCategory) {
            const idx = start + categoryIdx
            setDefaultObject(categoryMapping, selectedCategory)
            const categoryKpi = kpiColumn ? archiveData[kpiColumn][idx] : ''
            addToObject(categoryMapping[category], 'kpis', [categoryKpi])
            if (!('name' in categoryMapping[category])) {
              let unit = unitColumn ? archiveData[unitColumn][idx] : ''
              if (technology === 'ROUTINE' && feature === 'SLV') unit = 'minutes'
              addToObject(
                categoryMapping[category],
                'name',
                ((technology === 'CLX' && categoryKpi) || !unit || unit === 'null'
                  || category.toUpperCase().includes(`(${unit.toUpperCase()})`))
                  ? category : `${category} (${unit})`
              )
            }
          }
        })
      })
    }
  })
  Object.keys(categoryMapping).forEach((category) => {
    categoryMapping[category].kpis = _.uniq(categoryMapping[category].kpis)
  })
  return categoryMapping
}

const getColSpan = (colName, categoryMapping) => {
  if (colName === '') return 1
  const [mapping] = Object.values(categoryMapping).filter(val => val.name === colName)
  if (!mapping) return 1
  return mapping.kpis.length
}

const getColumnHeaders = (technology, feature, categoryMapping, reportType) => {
  const colHeaders = []
  const subColHeaders = []
  let nOuterCol = 0
  switch (true) {
    case technology === 'CLX' && feature === 'GEOFENCING':
      colHeaders.push(...['Devices', 'Config', 'Fence'])
      subColHeaders.push(...['', '', ''])
      nOuterCol = 2
      break
    case reportType === SAL3 && technology === 'CLX' && feature === 'SEPARATIONALERTS':
      colHeaders.push(...['Scenario'])
      subColHeaders.push(...[''])
      nOuterCol = 0
      break
    case technology === 'CLX' && feature === 'SEPARATIONALERTS':
      colHeaders.push(...['Devices', 'Config', 'Type'])
      subColHeaders.push(...['', '', ''])
      nOuterCol = 2
      break
    case technology === 'CLX' && feature === 'MICROLOCATIONS':
      colHeaders.push(...['Devices', 'Config', 'Microlocation'])
      subColHeaders.push(...['', '', ''])
      nOuterCol = 2
      break
    case technology === 'CLX' && feature === 'WSB':
      colHeaders.push(...['Devices', 'Config'])
      subColHeaders.push(...['', ''])
      nOuterCol = 2
      break
    case technology === 'R1' || technology === 'BA':
      colHeaders.push(...['Select', 'Devices', 'Items'])
      subColHeaders.push(...['', '', ''])
      nOuterCol = 2
      break
    case technology === 'GNSS' && reportType === PERFORMANCE:
      colHeaders.push(...['Select', 'Devices', 'Config'])
      subColHeaders.push(...['', '', ''])
      nOuterCol = 3
      break
    case technology === 'GNSS' && reportType === L5:
      colHeaders.push(...['Items'])
      subColHeaders.push(...[''])
      nOuterCol = 0
      break
    case reportType === NMEA:
      colHeaders.push(...['Select', 'Devices', 'Frequency'])
      subColHeaders.push(...['', '', ''])
      nOuterCol = 2
      break
    case technology === 'REPLAY' && feature === 'NEARBYD':
      colHeaders.push(...['Select', 'JobName', 'Items'])
      subColHeaders.push(...['', '', ''])
      nOuterCol = 2
      break
    default:
      colHeaders.push(...['Select', 'Devices'])
      subColHeaders.push(...['', ''])
      nOuterCol = 2
      break
  }
  Object.keys(categoryMapping).forEach((category) => {
    const { name: categoryName, kpis: categoryKpis } = categoryMapping[category]
    colHeaders.push(categoryName)
    categoryKpis.forEach((kpi) => {
      if (kpi === '100%') subColHeaders.push('Max')
      else if (kpi === '0%') subColHeaders.push('Min')
      else subColHeaders.push(kpi)
    })
  })
  if (subColHeaders.filter(subColumn => subColumn !== '').length === 0) return [colHeaders, []]
  return [colHeaders, subColHeaders, nOuterCol]
}

const formatSubColHeader = (subColHeader, technology) => {
  switch (true) {
    case technology === 'CLX':
      return KPI_NAMES.CLX[subColHeader] || subColHeader
    case subColHeader.includes('rdar://'):
      const matches = subColHeader.match(/(\d+)/)
      const radarId = matches ? matches[0] : 'N/A'
      return <a href={subColHeader.slice(1, subColHeader.length - 1)}>{radarId}</a>
    case technology === 'ROUTINE':
      if (subColHeader === 'yield') return `${subColHeader} (%)`
      return subColHeader
    case technology === 'BA':
      if (subColHeader === 'null') return ''
      return subColHeader
    default:
      break
  }
  return subColHeader
}

const getHeader = (technology, feature, categoryMapping, archiveIds, filters, setFilters, reportType) => {
  const [colHeaders, subColHeaders] = getColumnHeaders(technology, feature, categoryMapping, reportType)
  console.log(colHeaders, subColHeaders)
  const getSubColumnHeaders = () => {
    let colIdx = 0
    return _.map(colHeaders, (colHeader) => {
      const colSpan = getColSpan(colHeader, categoryMapping)
      return _.range(colSpan).map((subIdx) => {
        let className = ''
        if (subIdx === 0) className += 'border-left '
        if (subIdx === colSpan - 1) className += 'border-right '
        const subColHeader = formatSubColHeader(subColHeaders[colIdx], technology)
        colIdx += 1
        if (subColHeader !== '') className += 'table-header '
        return (
          <Table.TH
            borderTop="none"
            key={shortid.generate()}
            className={className}
          >
            {subColHeader}
          </Table.TH>
        )
      })
    })
  }
  return (
    <Table.THead borderTop="none" borderBottom="none">
      <Table.TR borderTop="none" borderBottom="none">
        {_.map(colHeaders, (colHeader, idx) => (
          <Table.TH
            key={shortid.generate()}
            className={
              colHeader !== ''
                ? 'table-header border-left border-right'
                : 'empty-header'
            }
            colSpan={getColSpan(colHeader, categoryMapping)}
            style={subColHeaders.length !== 0 ? { borderBottom: 'none' } : {}}
          >
            {colHeader === 'Select' ? (
              <div className="select-header">
                <Filter
                  title="Select"
                  type="archiveIds"
                  items={archiveIds}
                  filters={filters}
                  setFilters={setFilters}
                  showItems={false}
                />
              </div>
            ) : colHeader}            
          </Table.TH>
        ))}
      </Table.TR>
      {subColHeaders.length > 0 && (
        <Table.TR borderTop="none">
          {getSubColumnHeaders()}
        </Table.TR>
      )}
    </Table.THead>
  )
}

const getTableBody = (
  archivesInfo, archives, technology, feature, filters, setFilters, categoryMapping, reportType, parentTableDataSet
) => {
  const tableBody = []
  const archiveLabels = createArchiveLabels(archives)
  Object.keys(archivesInfo).forEach((archiveId) => {
    const archiveData = archivesInfo[archiveId]
    const isValid = isValidArchiveData(archiveData, archiveId, archiveLabels, filters, ['archives'])
    if (isValid) {
      tableBody.push(
        <SummaryRow
          key={shortid.generate()}
          archive={_.find(archives, archive => archive.id === archiveId)}
          archiveData={archiveData}
          archiveLabel={archiveLabels[archiveId]}
          technology={technology}
          feature={feature}
          filters={filters}
          setFilters={setFilters}
          categoryMapping={categoryMapping}
          reportType={reportType}
          parentTableDataSet={parentTableDataSet}
        />
      )
    }
  })
  return tableBody
}

const SummaryTableToCSV = (tableData, archives, colHeadersExt, subColHeaders, nOuterCol, reportType = DEFAULT_REPORT_TYPE) => {
  // Remove OuterCol columns from headers, they are not included from SummaryRow data
  let csvString = `Devices,${colHeadersExt.slice(nOuterCol).join()}\n`
  csvString += `,${subColHeaders.slice(nOuterCol).join()}\n`
  _.forEach(tableData, (rowsData, device_info) => {
    rowsData.forEach((row) => {
      const valueRow = row.map((item) => reportType === CTP ? item.rawValue : item.value)
      csvString += `${device_info},${valueRow.join()}\n`
    })
  });
  return csvString
} 

const SummaryTable = ({ archives, technology, feature, filters, setFilters, visible=true, reportType = DEFAULT_REPORT_TYPE }) => {
  const archiveIds = archives.map(archive => archive.id)
  const summaryInfo = getSummaryInfo(technology, feature, reportType)
  const { customFilters = {} } = filters
  const { table_name: ui_table_name } = customFilters
  const { tableName } = summaryInfo
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, tableName)
  const [tableState, setTableState] = useState({
    body: [],
    header: null,
    isProcessing: true
  })
  const { errorMessage } = archivesInfo
  const { body, header, isProcessing } = tableState

  const [dlTableData, setDlTableData] = useState({})  // each row build data and set here


  useEffect(() => {
    if (!isLoading && !errorMessage && visible) {
      const categoryMapping = getCategoryMapping(technology, feature, archivesInfo, summaryInfo, filters, reportType)
      const newTableBody = getTableBody(archivesInfo, archives, technology, feature, filters, setFilters, categoryMapping, reportType, setDlTableData)
      const newHeader = getHeader(technology, feature, categoryMapping, archiveIds, filters, setFilters, reportType)
      setTableState({
        body: newTableBody,
        header: newHeader,
        isProcessing: false
      })
    }
  }, [isLoading, archivesInfo, errorMessage, filters, visible])

  const handleDownload = () => {
    // Create headers. There are nOuterCol columns are not included from SummaryRow data
    const categoryMapping = getCategoryMapping(technology, feature, archivesInfo, summaryInfo, filters, reportType)
    const [colHeaders, subColHeaders, nOuterCol] = getColumnHeaders(technology, feature, categoryMapping, reportType)
    let colHeadersExt = []
    _.map(colHeaders, (colHeader) => {
      const colSpan = getColSpan(colHeader, categoryMapping)
      colHeadersExt.push(...Array(colSpan).fill(colHeader))
    })
    const d_data = new Blob( [SummaryTableToCSV(dlTableData, archives, colHeadersExt, subColHeaders, nOuterCol, reportType)], {type:'text/json;charset=utf-8,'})
    const url = URL.createObjectURL(d_data);
    const e = document.getElementById(`${tableName} ${ui_table_name} download`)
    e.setAttribute('href', url)
    const fileName = ui_table_name ? `${tableName}_${ui_table_name}.csv` : `${tableName}.csv`
    e.setAttribute('download', fileName)
    e.click()
  }

  console.log('Rendering SummaryTable')
  return (
    visible && (
      <>
        {(errorMessage || (body.length === 0 && !isProcessing))
          ? <ErrorMessage />
          : (
            <div className="summary-table">
              {body.length > 0 && (
                <Row className="justify-content-end">
                  <Text mr="15px" ml="15px" mt="5px">
                    <Link id={`${tableName} ${ui_table_name} download`} href="/" variant="default" onClick={handleDownload}>Download</Link>
                  </Text>
                </Row>
              )}
              <SummaryTableLegend technology={technology} feature={feature} reportType={reportType} />
              {technology !== 'CLX' ? (
                <div className="outer-table">
                  <div className="inner-table">
                    <Table>
                      {header}
                      <Table.TBody>
                        {body}
                      </Table.TBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <Table>
                  {header}
                  <Table.TBody>
                    {body}
                  </Table.TBody>
                </Table>
              )}
            </div>
          )}
        <Spinner visible={isLoading} />
      </>
    )
  )
}

export default React.memo(SummaryTable)
