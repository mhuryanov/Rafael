import React, { useState } from 'react'
import Table from '@tidbits/react-tidbits/Table'
import { SearchInput } from '@dx/continuum-search-input'
import { Text } from '@tidbits/react-tidbits'

import KpiCriteriaBody from './KpiCriteriaBody'

const shortid = require('shortid')

const formatCategoryMapping = (categoryMapping) => {
  const formattedCategoryMapping = {}
  Object.entries(categoryMapping).forEach(([category, kpis]) => {
    if (kpis.length === 0) {
      formattedCategoryMapping[category] = ['']
    } else formattedCategoryMapping[category] = kpis
  })
  return formattedCategoryMapping
}

const getHeader = (technology, feature, meta, categoryMapping) => {

  const header = (
    <Table.THead>
      <Table.TR borderBottom="none">
        {Object.keys(meta).map(metaKey => (
          <Table.TH key={metaKey}>
            {metaKey}
          </Table.TH>
        ))}
        {Object.keys(categoryMapping).map(category => (
          <Table.TH key={category} colSpan={categoryMapping[category].length}>
            {`${category}`}
          </Table.TH>
        ))}
      </Table.TR>
      <Table.TR borderTop="none">
        {Object.keys(meta).map(metaKey => (
          <Table.TH key={metaKey}>
            {' '}
          </Table.TH>
        ))}
        {Object.values(categoryMapping).map(kpis => (
          kpis.map(kpi => (
            <Table.TH key={shortid.generate()}>
              {kpi}
            </Table.TH>
          ))
        ))}
      </Table.TR>
    </Table.THead>
  )

  return header
}


const KpiCriteriaTable = ({ technology, feature, meta, categoryMapping, timeRange }) => {
  const formattedCategoryMapping = formatCategoryMapping(categoryMapping)
  const header = getHeader(technology, feature, meta, formattedCategoryMapping)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e) => {
    const { value } = e.target
    setSearchTerm(value)
  }

  console.log('Rendering KpiCriteriaTable')
  return (
    <div style={{ marginTop: '25px' }}>
      <Text textStyle="h4Emph" mb="15px">
        {`KPI Criteria for ${technology} ${feature}, ${timeRange.label}`} 
      </Text>
      <div style={{ maxWidth: '200px', marginBottom: '15px' }}>
        <SearchInput placeholder="Filter by key word" onChange={handleSearch} />
      </div>
      <div className="kpi-criteria-table">
        <Table>
          {header}
          <Table.TBody>
            <KpiCriteriaBody
              technology={technology}
              feature={feature}
              categoryMapping={formattedCategoryMapping}
              searchTerm={searchTerm}
              meta={meta}
              timeRange={timeRange}
            />
          </Table.TBody>
        </Table>
      </div>
    </div>
  )
}

export default React.memo(KpiCriteriaTable)
