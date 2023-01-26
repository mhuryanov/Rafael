/* eslint-disable react/forbid-prop-types */
import React from 'react'
import { Text } from '@tidbits/react-tidbits'

import { colorMap } from './helpers'
import { CTP } from '../../../utilities/constants'

const outcomeMapping = {
  Pass: 'green',
  'Pass w/ Issues': 'yellow',
  Fail: 'red',
  'N/A': 'lightgray',
  'No Log': 'purple'
}

export const LegendEntry = ({ color, children }) => {
  return (
    <div>
      <Text p="5px" mr="5px">
        <span className="color-block legend-entry" style={{ backgroundColor: colorMap[color] }} />
        <span>{children}</span>
      </Text>
    </div>
  )
}

const SummaryTableLegend = ({ technology, feature, reportType, providedMapping}) => {
  let outcomes
  let colorMapping = ((providedMapping) ? providedMapping : outcomeMapping)
  switch (true) {
    case reportType === CTP:
      outcomes = ['Pass', 'Pass w/ Issues', 'Fail', 'N/A', 'No Log']
      break
    default:
      outcomes = ['Pass', 'Pass w/ Issues', 'Fail']
      break
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'row', marginTop: '10px', marginBottom: '5px' }}>
      {outcomes.map(outcome => (
        <LegendEntry key={outcome} color={colorMapping[outcome]}>
          {outcome}
        </LegendEntry>
      ))}
    </div>
  )
}

export default React.memo(SummaryTableLegend)
