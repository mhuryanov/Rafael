/* eslint-disable react/forbid-prop-types */
import React, { useContext } from 'react'

import { FeatureContext } from '../../Pages/TechnologyPage/FeatureContext'
import TableEntry from './TableEntry'

const E911TableEntry = ({ category, kpiName, testDate, entry }) => {
  const { kpis } = useContext(FeatureContext)
  const name = `${category}&${kpiName}`
  const entryKpis = kpis.filter((kpi) => {
    return (category.toUpperCase().includes(kpi.category.toUpperCase())
      && (kpiName.toUpperCase() === kpi.name.toUpperCase() || kpi.name === '')
      && kpi.date <= testDate
    )
  })
  const [entryKpi] = entryKpis.sort((a, b) => a.date < b.date)

  return (
    <TableEntry name={name} entry={entry} entryKpi={entryKpi} />
  )
}

export default React.memo(E911TableEntry)
