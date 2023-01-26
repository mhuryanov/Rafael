import React from 'react'

import { getColorStyle } from './helpers'
import { getCriteriaColor, reverseOperator } from '../../../utilities/helpers'
import IconPopover from '../../Widgets/IconPopover'
import { LegendEntry } from './SummaryTableLegend'


const getPopoverLegend = (name, criteria) => {
  const { target, nte, operator } = criteria
  return (
    <>
      <div style={{ marginBottom: '10px' }}>{name.split('&').join(', ')}</div>
      {target && (
        <LegendEntry color="green">
          Pass: <strong>{`x ${reverseOperator(operator)} ${target}`}</strong>
        </LegendEntry>
      )}
      {target && !nte && (
        <LegendEntry color="red">
            Fail: <strong>{`x ${operator === '=' ? '!=' : operator} ${target}`}</strong>
        </LegendEntry>
      )}
      {nte && (
        <>
          <LegendEntry color="yellow">
            Warning: <strong>{`${target} ${reverseOperator(operator)} x ${reverseOperator(operator)} ${nte}`}</strong>
          </LegendEntry>
          <LegendEntry color="red">
            Fail: <strong>{`x ${operator} ${nte}`}</strong>
          </LegendEntry>
        </>
      )}
    </>
  )
}

const TableEntry = ({ name, entry, entryKpi }) => {
return (
  entryKpi ? (
    <span
      className="table-entry"
      style={getColorStyle(getCriteriaColor(entry.value, entryKpi.criteria))}
    >
      <IconPopover
        title="Pass/Fail Criteria"
        content={getPopoverLegend(entryKpi.unique_name, entryKpi.criteria)}
        icon={entry.value}
      />
    </span>
    ) : (
      <span className="table-entry" style={getColorStyle(entry.color)}>
        {entry.value}
      </span>
    )
  )
}

export default React.memo(TableEntry)
