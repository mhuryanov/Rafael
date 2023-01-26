import React, { lazy, Suspense, useContext, useEffect, useState} from 'react'
import { Input } from '@tidbits/react-tidbits'
import Table from '@tidbits/react-tidbits/Table'
import { Link } from 'react-router-dom'
import { InlineSpinner } from '@tidbits/react-tidbits/Spinner/Spinner'

import { CTP, PERFORMANCE, L5, NMEA, SAL3 } from '../../../utilities/constants'
import {
  filterToggle,
  filterArchiveData,
  getStartIdx,
  getEndIdx,
  isEmpty,
  getIndices,
} from '../../../utilities/helpers'
import { getSummaryInfo, getColorStyle } from './helpers'
import { E911VerdictIcons, E911VerdictMapping, BLOCKED } from '../../Pages/TechnologyPage/E911/E911DeviceDetails'
import IconPopover from '../../Widgets/IconPopover'
import { FITNESS_FEATURES } from '../../../utilities/constants'
import { FeatureContext } from '../../Pages/TechnologyPage/FeatureContext'

const GnssTableEntry = lazy(() => import('./GnssTableEntry'))
const TTFFTableEntry = lazy(() => import('./TTFFTableEntry'))
const FitnessTableEntry = lazy(() => import('./FitnessTableEntry'))
const E911TableEntry = lazy(() => import('./E911TableEntry'))

const shortid = require('shortid')
const _ = require('underscore')


const colStyle = { fontStyle: 'italic', fontSize: '15px' }
const getStaticStyle = (rowIdx, numRows) => {
  const style = { borderBottom: 'none', borderTop: 'none' }
  if (rowIdx === 0) {
    delete style.borderTop
  }
  if (rowIdx === numRows) delete style.borderBottom
  return style
}

const formatValue = (value) => {
  let valueToShow = 'N/A'
  if (value !== '') {
    if (!isNaN(Number(value)) && Number(value) !== -1) {
      if (Number(value) % 1 === 0) valueToShow = Number(value)
      else valueToShow = Number(value).toFixed(2)
    } else valueToShow = value
  }
  return valueToShow
}

const numSpecialCols = (technology, feature, reportType) => {
  switch (true) {
    case (
      technology === 'R1' 
      || (technology === 'CLX' && feature !== 'TRENDS') /* feature = geofence/SA/ML reportType = SVL3 */
      || technology === 'BA' 
      || (technology === 'GNSS' && reportType === L5)
      || (technology === 'REPLAY' && ['NEARBYD'].includes(feature))
      || (reportType === 'NMEA')
    ):
      return 1
    default:
      return 0
  }
}

// 2021-07-02 Support multiple row. No need add new columns as primary key
const getMultiRow = (
  archiveData, summaryInfo, filters, categoryMapping, specialInfo = {}
) => {
  const {
    segmentColumn,
    sourceColumn,
    tableNameColumn,
    categoryColumn,
    kpiColumn,
    valueColumn,
    colorColumn
  } = summaryInfo
  const { customFilters = {} } = filters
  const { segment, source, table_name } = customFilters
  let [start, end] = filterArchiveData(
    archiveData, segment, segmentColumn, source, sourceColumn, table_name, tableNameColumn
  )
  let indices = end ? _.range(start, end) : _.range(archiveData[categoryColumn].length)
  let ignoreFormattingCols = ['build_name', 'first_half_avg', 'second_half_avg']
  if (!isEmpty(specialInfo)) {
    indices = getIndices(archiveData, indices, specialInfo.col, specialInfo.value)
  }
  let multiRows = undefined
  Object.keys(categoryMapping).forEach((category) => {
    const categoryIndices = getIndices(archiveData, indices, categoryColumn, category)
    const { kpis } = categoryMapping[category]
    kpis.forEach((kpi) => {
      const kpiIdxs = _.filter(categoryIndices, idx => archiveData[kpiColumn][idx] === kpi)
      if (kpiIdxs.length) {
        if (multiRows === undefined){
          multiRows = Array.from(Array(kpiIdxs.length), () => isEmpty(specialInfo)?[]:[{ value: specialInfo.value }]);
        }
        kpiIdxs.forEach( (kpiIdx, idx) => {
          let value = archiveData[valueColumn][kpiIdx]
          // color column doesn't always exist for older data
          const color = archiveData[colorColumn] ? archiveData[colorColumn][kpiIdx] : ''
          value = (ignoreFormattingCols.includes(category) ? value : formatValue(value))
          multiRows[idx].push({
            value: value,
            color
          })
        })
      } else {
        if (multiRows === undefined){
          multiRows = Array.from(Array(1), () => isEmpty(specialInfo)?[]:[{ value: specialInfo.value }]);
        }
        multiRows[0].push({value: "-", color: ""})
      }
      
    })
  })
  return multiRows
}

const getCTPRow = (
  archiveData, summaryInfo, categoryMapping
) => {
  const {
    categoryColumn,
    verdictColumn,
    descriptionColumn,
  } = summaryInfo
  const row = []
  Object.keys(categoryMapping).forEach((category) => {
    const index = archiveData[categoryColumn].indexOf(category)
    const verdict = archiveData[verdictColumn][index] || BLOCKED
    const description = archiveData[descriptionColumn][index] || 'Test not applicable.'
    row.push({
      value: <IconPopover
        title={`${category}`}
        content={(
          <div className="scanner-detail">{description}</div>
        )}
        icon={E911VerdictIcons[verdict]}
      />,
      rawValue: `${E911VerdictMapping[verdict]}(${verdict})`,
    })
  })
  return row
}

const getTableEntry = (technology, feature, category, kpi, archive, filters, entry, reportType) => {
  const { test_date: testDate, id: archiveId } = archive
  const { customFilters = {} } = filters
  const { segment, source } = customFilters
  if ((technology === 'GNSS' && source === 'WiFi') || (technology === 'GNSS' && source === 'WiFi2')) { // ignore KPI criteria
    return (
      <span className="table-entry">
        {entry.value}
      </span>
    )
  }
  // TODO: Once smart tagging is implemented, these table entries can all be made generic.
  switch (true) {
    case technology === 'GNSS' && feature === 'TTFF' && reportType !== L5 && reportType !== NMEA :
      const { device_type: device } = archive
      return (
        <Suspense fallback={<InlineSpinner visible />}>
          <TTFFTableEntry category={category} kpiName={kpi} segment={segment} device={device} testDate={testDate} entry={entry} />
        </Suspense>
      )
    case technology === 'GNSS' && FITNESS_FEATURES.includes(feature) && reportType !== L5 && reportType !== NMEA :
      return (
        <Suspense fallback={<InlineSpinner visible />}>
          <FitnessTableEntry archiveId={archiveId} category={category} kpiName={kpi} segment={segment} testDate={testDate} entry={entry} />
        </Suspense>
      )
    case technology === 'GNSS' && feature === 'DRIVE' && reportType !== L5 && reportType !== NMEA :
      return (
        <Suspense fallback={<InlineSpinner visible />}>
          <GnssTableEntry archiveId={archiveId} category={category} kpiName={kpi} segment={segment} testDate={testDate} entry={entry} />
        </Suspense>
      )
    case technology === 'E911' && reportType !== NMEA :
      return (
        <Suspense fallback={<InlineSpinner visible />}>
          <E911TableEntry category={category} kpiName={kpi} testDate={testDate} entry={entry} />
        </Suspense>
      )
    default:
      return (
        <span className="table-entry" style={getColorStyle(entry.color)}>
          {entry.value}
        </span>
      )
  }
}

const getTableEntries = (technology, feature, archiveRow, categoryMapping, archive, filters, reportType) => {
  let colIdx = 0
  const specialCols = _.range(numSpecialCols(technology, feature, reportType)).map(() => {
    const col = archiveRow[colIdx]
    colIdx += 1
    return (
      <Table.TD className="border-left border-right" style={colStyle} key={shortid.generate()}>
        <span className="table-entry" style={getColorStyle(col.color)}>
          {col.value}
        </span>
      </Table.TD>
    )
  })
  const categoryCols = Object.entries(categoryMapping).map(([category, mapping]) => (
    mapping.kpis.map((kpi, subIdx) => {
      const col = archiveRow[colIdx]
      colIdx += 1
      if (col !== undefined) {
        let className = ''
        if (subIdx === 0) className += 'border-left '
        if (subIdx === mapping.kpis.length - 1) className += 'border-right'
        return (
          <Table.TD
            className={className}
            style={colStyle}
            key={shortid.generate()}
          >
            {getTableEntry(technology, feature, category, kpi, archive, filters, col, reportType)}
          </Table.TD>
        )
      }
      return null
    })
  ))
  return specialCols.concat(categoryCols)
}


const getUniqueItems = (
  archiveData, summaryInfo, filters, itemsColumn
) => {
  const {
    segmentColumn,
    sourceColumn,
    tableNameColumn,
  } = summaryInfo
  const { customFilters = {} } = filters
  const { segment, source, table_name } = customFilters
  let [start, end] = filterArchiveData(
    archiveData, segment, segmentColumn, source, sourceColumn, table_name, tableNameColumn
  )
  if (start >= 0){
    return _.uniq(archiveData[itemsColumn].slice(start, end))
  } else {
    return []
  }
}

const SummaryRow = ({
  technology, feature, archive, archiveData, archiveLabel, filters, setFilters, categoryMapping, reportType, parentTableDataSet
}) => {
  const notReadFCReportTypes = [L5, SAL3]
  const { id: archiveId } = archive
  const fc = useContext(FeatureContext)
  const { metaMapping, metaKeys } = (typeof(fc) === 'undefined' || notReadFCReportTypes.includes(reportType)) ? {metaMapping: {}, metaKeys: []} : fc
  const userMeta = metaMapping[archiveId] || {}
  const archiveRows = []
  const summaryInfo = getSummaryInfo(technology, feature, reportType)
  switch (true) {
    case ((technology === 'R1' && ['FINDMY','FINDBTRSSI'].includes(feature)) 
          || (technology === 'BA' && ['LKL', 'OFFLINEFINDING'].includes(feature)) 
          || (technology === 'GNSS' && reportType === L5) 
          || (reportType === NMEA)
          || (technology === 'CLX' && ['GEOFENCING', 'SEPARATIONALERTS','MICROLOCATIONS'].includes(feature))
          || (technology === 'REPLAY' && ['NEARBYD'].includes(feature))
          ):
      const { itemsColumn } = summaryInfo
      const items = getUniqueItems(archiveData, summaryInfo, filters, itemsColumn)
      items.forEach((item) => {
        const newRows = getMultiRow(archiveData, summaryInfo, filters, categoryMapping, { value: item, col: itemsColumn })
        newRows.forEach(row => { archiveRows.push(row) })
      })
      break
    case reportType === CTP:
      archiveRows.push(getCTPRow(archiveData, summaryInfo, categoryMapping))
      break
    default:
      //archiveRows.push(getArchiveRow(archiveData, summaryInfo, filters, categoryMapping))
      const newRows = getMultiRow(archiveData, summaryInfo, filters, categoryMapping)
      newRows.forEach(row => { archiveRows.push(row) })
      break
  }
  const { archiveIds, customFilters } = filters
  const queryString = (customFilters && 'group' in customFilters && 'table_name' in customFilters) ? `?groupName=${customFilters.table_name}` : ''

  useEffect(() => {
    if (parentTableDataSet && archiveRows) {
      parentTableDataSet((preTable) => {
        const archive_info = metaKeys.reduce((acc, key) => acc ? `${acc}, ${userMeta[key] || 'N/A'}` : userMeta[key] || 'N/A', '')
        return {
          ...preTable,
          [archiveLabel.label]: archiveRows
        }
      })
    }
  }, [archiveRows]);

  
  
  const handleCheck = () => {
    setFilters((prevState) => {
      const prevArchiveIds = prevState.archiveIds
      const newArchiveIds = filterToggle(prevArchiveIds, archiveId)
      return {
        ...prevState,
        archiveIds: newArchiveIds
      }
    })
  }

  return (
    archiveRows.map((archiveRow, rowIdx) => (
      <Table.TR key={shortid.generate()}>
        {technology !== 'CLX' && reportType !== L5 && (
          <Table.TD className="border-left border-right" style={{ ...colStyle, ...getStaticStyle(rowIdx, archiveRows.length - 1) }}>
            {rowIdx === 0 ? (
              <Input.CircleCheckbox
                style={{ cursor: 'pointer' }}
                defaultChecked={archiveIds.includes(archiveId)}
                onChange={handleCheck}
              />
            ) : ''}
          </Table.TD>
        )}
        {(reportType !== L5 && reportType !== SAL3) && !(technology === 'CLX' && feature === 'TRENDS') && (
          <Table.TD className="border-left border-right" style={{ ...colStyle, ...getStaticStyle(rowIdx, archiveRows.length - 1) }}>
            {(rowIdx === 0) ? (
              <div style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                <span className="color-block" style={{ backgroundColor: archiveLabel.color }} />
                <span className="table-entry">
                  <Link to={`/technology/${technology}/${feature}/${reportType}/device/${archiveId}${queryString}`}>{archiveLabel.label}</Link>
                </span>
              </div>
            ) : ''}
          </Table.TD>
        )}
        {reportType === PERFORMANCE && (technology === 'GNSS' || (technology === 'CLX' && feature !== 'TRENDS')) && (
          <Table.TD className="border-left border-right" style={{ ...colStyle, ...getStaticStyle(rowIdx, archiveRows.length - 1) }}>
            {(rowIdx === 0) ? (
              <div style={{ textAlign: 'left' }}>
                <span className="table-entry">
                  {metaKeys.reduce((acc, key) => acc ? `${acc}, ${userMeta[key] || 'N/A'}` : userMeta[key] || 'N/A', '')}
                </span>
              </div>
            ) : ''}
          </Table.TD>
        )}
        {getTableEntries(technology, feature, archiveRow, categoryMapping, archive, filters, reportType)}
      </Table.TR>
    ))
  )
}

export default React.memo(SummaryRow)
