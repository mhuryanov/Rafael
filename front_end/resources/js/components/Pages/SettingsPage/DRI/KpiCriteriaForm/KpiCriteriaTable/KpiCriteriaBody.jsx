import React, { useEffect, useState } from 'react'
import Table from '@tidbits/react-tidbits/Table'

import { useFetchRafael } from '../../../../../../hooks/fetchData'
import { KPI_MAPPING_API } from '../../../../../../utilities/constants'
import { setDefaultObject, sortedByKey, isEmpty } from '../../../../../../utilities/helpers'
import EditKpi from './EditKpi'


const getMetaValues = (meta) => {
  const metaValues = []
  const helper = (i, key) => {
    if (i === Object.keys(meta).length) {
      if (key) metaValues.push(key.toLowerCase())
    } else {
      meta[Object.keys(meta)[i]].forEach((metaValue) => {
        helper(i + 1, key ? `${key}&${metaValue}` : metaValue)
      })
    }
  }
  helper(0, '')
  return metaValues.length > 0 ? metaValues : ['']
}

const getCriteriaLabel = (criteria) => {
  if (isEmpty(criteria)) return 'None'
  const { target = '', nte = '' } = criteria
  return (
    <>
      {target && <span style={{ color: 'green' }}>{target}</span>}
      {target && nte && '/'}
      {nte && <span style={{ color: 'red' }}>{nte}</span>}
    </>
  )
}

const KpiCriteriaBody = ({ technology, feature, categoryMapping, searchTerm, meta, timeRange }) => {
  const [hash, reset] = useState(null)
  const [isLoading, fetchedKpis] = useFetchRafael({ url: `${KPI_MAPPING_API}${technology}/${feature}` }, [hash])
  const [kpiMapping, setKpiMapping] = useState({})
  const [metaValues, setMetaValues] = useState([])
  const { errorMessage } = fetchedKpis

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const newMetaValues = getMetaValues(meta)
      setMetaValues(newMetaValues)
      setKpiMapping(() => {
        const newKpiMapping = {}
        newMetaValues.forEach((metaValue) => {
          setDefaultObject(newKpiMapping, metaValue)
          Object.entries(categoryMapping).forEach(([category, kpiNames]) => {
            setDefaultObject(newKpiMapping[metaValue], category)
            kpiNames.forEach((kpiName) => {
              setDefaultObject(newKpiMapping[metaValue][category], kpiName)
              newKpiMapping[metaValue][category][kpiName] = {}
            })
          })
        })
        fetchedKpis.forEach((kpi) => {
          const { name, category, criteria, meta: kpiMeta, date } = kpi
          if (date === timeRange.value) {
            const kpiMetaValue = Object.values(sortedByKey(kpiMeta)).reduce((acc, metaValue, i) => {
              if (i > 0) {
                return `${acc}&${metaValue}`
              }
              return `${metaValue}`
            }, '').toLowerCase()
            if (kpiMetaValue in newKpiMapping
              && category in newKpiMapping[kpiMetaValue]
              && name in newKpiMapping[kpiMetaValue][category]
            ) {
              newKpiMapping[kpiMetaValue][category][name] = criteria
            }
          }
        })
        return newKpiMapping
      })
    }
  }, [isLoading, fetchedKpis, meta, categoryMapping, timeRange])

  const filteredMetaValues = metaValues.filter((metaValue) => {
    const filterTerms = searchTerm.split(' ')
    const isValid = filterTerms.reduce((acc, term) => {
      const formattedTerm = term.replace(/"/g, '')
      if (term[0] === '"' && term[term.length - 1] === '"') {
        return acc && metaValue.toUpperCase() === formattedTerm.toUpperCase()
      }
      return acc && metaValue.toUpperCase().includes(formattedTerm.toUpperCase())
    }, true)
    return isValid
  })

  console.log('Rendering KpiCriteriaForm')
  return (
    filteredMetaValues.map((metaValue, i) => (
      <Table.TR key={metaValue}>
        {metaValue && metaValue.split('&').map(key => (
          <Table.TD>
            {key}
          </Table.TD>
        ))}
        {metaValue in kpiMapping && Object.entries(kpiMapping[metaValue]).map(([category, categoryKpis]) => (
          Object.entries(categoryKpis).map(([kpiName, criteria]) => (
            <Table.TD key={metaValue + category + kpiName}>
              <div className="kpi-criteria-entry">
                {getCriteriaLabel(criteria)}
                <EditKpi
                  technology={technology}
                  feature={feature}
                  metaValue={metaValue}
                  metaKeys={Object.keys(meta)}
                  category={category}
                  name={kpiName}
                  criteria={criteria}
                  timeRange={timeRange}
                  reset={reset}
                />
              </div>
            </Table.TD>
          ))
        ))}
      </Table.TR>
    ))
  )
}

export default React.memo(KpiCriteriaBody)
