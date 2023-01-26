/* eslint-disable react/forbid-prop-types */
import React, { useContext, useState, useEffect } from 'react'
import { useFetchRafael } from '../../../hooks/fetchData'

import { FeatureContext } from '../../Pages/TechnologyPage/FeatureContext'
import { ARCHIVE_META_API } from '../../../utilities/constants'
import TableEntry from './TableEntry'
import { isEmpty } from '../../../utilities/helpers'

const getPlacement = (userDefinedPlacement) => {
  switch (true) {
    case userDefinedPlacement.toUpperCase().includes('BELT'):
      return 'BELT'
    case userDefinedPlacement.toUpperCase().includes('WRIST'):
      return 'WRIST'
    default:
      return 'ARM_OR_HAND'
  }
}

const FitnessTableEntry = ({ archiveId, category, kpiName, segment, testDate, entry }) => {
  const { segmentMapping, kpis, metaMapping } = useContext(FeatureContext)
  const userMeta = metaMapping[archiveId] || {}
  const { Placement: userDefinedPlacement } = userMeta
  let entryKpi = null
  if (userDefinedPlacement) {
    const placement = getPlacement(userDefinedPlacement)
    const signalEnv = segmentMapping[segment] || 'unknown'
    entryKpi = kpis.filter((kpi) => {
      return (category.toUpperCase().includes(kpi.category.toUpperCase())
      && (kpiName.toUpperCase() === kpi.name.toUpperCase() || kpi.name === '')
        && 'environment' in kpi.meta && kpi.meta.environment.toUpperCase() === signalEnv.toUpperCase()
        && 'placement' in kpi.meta && kpi.meta.placement.toUpperCase() === placement.toUpperCase()
        && kpi.date <= testDate
      )
    }).sort((a, b) => a.date < b.date)[0]
  }

  return (
    <TableEntry entry={entry} entryKpi={entryKpi} />
  )
}

export default React.memo(FitnessTableEntry)
