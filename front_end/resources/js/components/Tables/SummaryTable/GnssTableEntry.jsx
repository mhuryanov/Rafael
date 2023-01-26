/* eslint-disable react/forbid-prop-types */
import React, { useContext } from 'react'

import { getPlacementType } from '../../../utilities/helpers'
import { FeatureContext } from '../../Pages/TechnologyPage/FeatureContext'
import TableEntry from './TableEntry'


const GnssTableEntry = ({ archiveId, category, kpiName, segment, testDate, entry }) => {
  const { segmentMapping, kpis, metaMapping } = useContext(FeatureContext)
  const userMeta = metaMapping[archiveId] || {}
  const { Placement: placement } = userMeta
  const signalEnv = segmentMapping[segment] || 'unknown'
  let entryKpi = null
  if (placement) {
    const mount = getPlacementType(placement)
    entryKpi = kpis.filter((kpi) => {
      return (category.toUpperCase().includes(kpi.category.toUpperCase())
        && (kpi.name.toUpperCase() === kpiName.toUpperCase() || kpi.name === '')
        && 'environment' in kpi.meta && kpi.meta.environment.toUpperCase() === signalEnv.toUpperCase()
        && 'placement' in kpi.meta && kpi.meta.placement.toUpperCase() === mount.toUpperCase()
        && kpi.date <= testDate
      )
    }).sort((a, b) => a.date < b.date)[0]
  }

  return (
    <TableEntry entryKpi={entryKpi} entry={entry} />
  )
}

export default React.memo(GnssTableEntry)
