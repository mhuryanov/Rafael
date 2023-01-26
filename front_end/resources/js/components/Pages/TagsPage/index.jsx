import React, {useEffect, useState, Suspense, lazy} from 'react'
import { Col, Row } from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { StatePanel } from '@dx/continuum-state-panel'
import { Button } from '@dx/continuum-button'
import { Navigation, NavigationItem } from '@dx/continuum-navigation'
import { useParams, useHistory } from 'react-router-dom'
import { DataGrid, DataGridColumn, DataGridRow } from '@dx/continuum-data-grid'

import Box from '../../Box'
import { useFetchRafael } from '../../../hooks/fetchData'
import { TAG_RULES_API } from '../../../utilities/constants'
import { isUserAdmin, isEmpty, sendToServer } from '../../../utilities/helpers'
import { SearchInput } from '@dx/continuum-search-input'
import SideNav from '../../Widgets/SideNav'

const RulesSideBar = lazy(() => import('./RulesSideBar'))

const shortid = require('shortid')

/* TAG RULES STRUCTURE
id: int,
name: str,
enabled: bool,
queries obj,
priority: int,
enable_from: str (optional),
enable_to: str (optional),
comments: str (optional)
*/

const COLUMNS = [
  'Name',
  'Enabled',
  'Queries',
  'Archives Count',
  'Priority',
  'Enable From',
  'Enable To',
  'Comments'
]

const TagsPage = () => {
  const [isLoading, allRules] = useFetchRafael({ url: TAG_RULES_API }, [])
  const [rules, setRules] = useState([])
  const [selectedRule, setSelectedRule] = useState(null)
  const hasWriteAccess = isUserAdmin()

  const handleAdd = () => {
    const newRule = {
      id: shortid.generate(),
      name: '_NEWRULE',
      queries: {},
      priority: 0,
    }
    setRules(prevRules => prevRules.concat(newRule))
    setSelectedRule(newRule)
  }

  const saveCallBack = (rule, id) => {
    setRules((prevRules) => {
      const newRules = JSON.parse(JSON.stringify(prevRules))
      const idx = _.findIndex(newRules, r => r.id === id)
      if (isEmpty(rule)) {
        newRules.splice(idx, 1)
      } else {
        newRules[idx] = rule
      }
      return newRules
    })
  }

  useEffect(() => {
    if (!isLoading && Array.isArray(allRules)) {
      setRules(allRules.sort((a, b) => a.name > b.name))
    }
  }, [isLoading, allRules])

  const handleCancel = () => {
    setSelectedRule(null)
  }

  const handleRowClick = (rule) => {
    setSelectedRule(_.find(rules, r => r.id === rule.id))
  }

  console.log('Rendering TagsPage')
  return (
    <Row className="page-container" style={{ height: '100%' }}>
      <Col style={{ maxWidth: '95%', marginLeft: '2%' }}>
        <div style={{ marginTop: '25px' }}>
          <Button variant="primary" onClick={handleAdd} disabled={!hasWriteAccess}>Add new rule</Button>
          <DataGrid
            onRowClick={hasWriteAccess && handleRowClick}
            variant="striped"
            pageSize={50}
            data={rules.map(rule => ({
              Name: selectedRule && rule.id === selectedRule.id ? <span style={{ color: 'rgb(25, 125, 254)' }}>{rule.name}</span> : rule.name,
              Enabled: rule.enabled ? 'Yes' : 'No',
              Queries: rule.queries && JSON.stringify(rule.queries),
              'Archives Count': rule.archives_count,
              Priority: rule.priority,
              'Enable From': rule.enable_from,
              'Enable To': rule.enable_to,
              Comments: rule.comments,
              id: rule.id,
              search: rule.name
            }))}
          >
            <DataGridRow>
              {COLUMNS.map(column => (
                <DataGridColumn key={column} field={column} />
              ))}
            </DataGridRow>
          </DataGrid>
        </div>
      </Col>
      {selectedRule && (
        <SideNav elementId="rules-sidebar">
          <RulesSideBar key={selectedRule.id} defaultRule={selectedRule} handleCancel={handleCancel} callBack={saveCallBack} />
        </SideNav>
      )}
      <div className="spinner-gray"><Spinner visible={isLoading} /></div>
    </Row>
  )
}

export default React.memo(TagsPage)
