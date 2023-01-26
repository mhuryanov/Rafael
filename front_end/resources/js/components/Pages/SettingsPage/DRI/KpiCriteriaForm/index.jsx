import React, { useState } from 'react'
import { Col } from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { Accordion, AccordionContent } from '@dx/continuum-accordion'
import { StatePanel } from '@dx/continuum-state-panel'

import { isEmpty } from '../../../../../utilities/helpers'
import KpiCriteriaTable from './KpiCriteriaTable'
import MetaForm from './MetaForm'
import TimeRangeForm from './TimeRangeForm'


const KpiCriteriaForm = ({ technology, feature }) => {
  const [timeRange, setTimeRange] = useState(null)
  const [meta, setMeta] = useState(null)
  const [categoryMapping, setCategoryMapping] = useState(null)

  console.log('Rendering KpiCriteriaForm')
  return (
    <>
      <TimeRangeForm technology={technology} feature={feature} setTimeRange={setTimeRange} />
      {timeRange && (
        <Col style={{ marginTop: '25px' }}>
          <Accordion
            features={{ toggleControls: false }}
          >
            <AccordionContent
              title='Meta Parameters'
              defaultExpanded
            >
              <MetaForm technology={technology} feature={feature} setMeta={setMeta} name="Reference" type="Meta" timeRange={timeRange} />
            </AccordionContent>
          </Accordion>
          <Accordion
            features={{ toggleControls: false }}
          >
            <AccordionContent
              title='KPIs'
              defaultExpanded
            >
              <MetaForm technology={technology} feature={feature} setMeta={setCategoryMapping} name="Category" type="KPIs" timeRange={timeRange} />
            </AccordionContent>
          </Accordion>
          {(meta && !isEmpty(categoryMapping)) ? (
            <KpiCriteriaTable technology={technology} feature={feature} meta={meta} categoryMapping={categoryMapping} timeRange={timeRange} />
          ) : (
            <StatePanel message="No criteria to show." suggestion="No KPIs specified." />
          )}
          <Spinner visible={!meta} />
        </Col>
      )}
    </>
  )
}

export default React.memo(KpiCriteriaForm)
