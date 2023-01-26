/* eslint-disable react/forbid-prop-types */
import React, { useContext } from 'react'

import { FeatureContext } from '../../Pages/TechnologyPage/FeatureContext'
import TableEntry from './TableEntry'

const TTFFTableEntry = ({ category, kpiName, segment, device, testDate, entry }) => {
  const { segmentMapping, kpis } = useContext(FeatureContext)
  const signalEnv = segmentMapping[segment] || 'unknown'
  const entryKpis = kpis.filter((kpi) => {
    return (category.toUpperCase().includes(kpi.category.toUpperCase())
    && (kpiName.toUpperCase() === kpi.name.toUpperCase() || kpi.name === '')
      && 'environment' in kpi.meta && kpi.meta.environment.toUpperCase() === signalEnv.toUpperCase()
      && 'device type' in kpi.meta && kpi.meta['device type'].toUpperCase() === device.toUpperCase()
      && kpi.date <= testDate
    )
  })
  const [entryKpi] = entryKpis.sort((a, b) => a.date < b.date)

  return (
    <TableEntry entry={entry} entryKpi={entryKpi} />
  )
}

export default React.memo(TTFFTableEntry)
