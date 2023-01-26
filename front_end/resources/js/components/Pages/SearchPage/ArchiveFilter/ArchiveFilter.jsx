/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-console */
/* eslint-disable react/prefer-stateless-function */
import React, { useState, useEffect, forwardRef } from 'react'
import {
  useHistory
} from 'react-router-dom'
import PropTypes from 'prop-types'
import {
  Alert, Button, Dropdown, Col, Row, FormControl, Form
} from 'react-bootstrap'
import {
  Query, Builder, Utils as QbUtils
} from 'react-awesome-query-builder'
import { getConfig, queryStringConverter } from './helpers'
import { labelCase, useQuery, getArchiveFilterParams, size } from '../../../../utilities/helpers'
import Constants from '../../../../utilities/constants'
import 'react-awesome-query-builder/css/antd.less'
import 'react-awesome-query-builder/css/styles.scss'
import 'react-awesome-query-builder/css/compact_styles.scss'
import { useFetchRafael } from '../../../../hooks/fetchData'

const _ = require('underscore')
const shortid = require('shortid')

const defaultTree = {
  "type":"group",
  "id":"a99a9a98-0123-4456-b89a-b174980f04ce",
  "children1":{
    "99aaba9a-cdef-4012-b456-7174980f04ce":{"type":"rule","properties":{"field":"fieldtests_technology.name","operator":"select_equals","value":[null],"valueSrc":["value"],"valueType":["select"]}},
    "ab8b98b8-89ab-4cde-b012-3174980f1d73":{"type":"rule","properties":{"field":"fieldtests_feature.name","operator":"select_equals","value":[null],"valueSrc":["value"],"valueType":["select"]}},
    "9b8bbba8-0123-4456-b89a-b1749dcb99ff":{"type":"rule","properties":{"field":"fieldtests_fieldtest.test_date","operator":"equal","value":[null],"valueSrc":["value"],"valueType":["date"]}},
    "abb98988-0123-4456-b89a-b1749e574e00":{"type":"rule","properties":{"field":"fieldtests_archivetype.name","operator":"select_equals","value":[null],"valueSrc":["value"],"valueType":["select"]}}
  },
  "properties":{"conjunction":"AND"}
}

const CustomMenu = forwardRef(
  ({
    children, style, className, 'aria-labelledby': labeledBy
  }, ref) => {
    const [value, setValue] = useState('')
    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        <FormControl
          autoFocus
          className="mx-3 my-2 w-auto"
          placeholder="Type to filter..."
          onChange={e => setValue(e.target.value)}
          value={value}
        />
        <ul className="list-unstyled">
          {React.Children.toArray(children).filter(
            child => !value || child.props.children.toLowerCase().indexOf(value.toLowerCase()) !== -1,
          )}
        </ul>
      </div>
    )
  },
)
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <a
    href=""
    ref={ref}
    onClick={(e) => {
      e.preventDefault()
      onClick(e)
    }}
  >
    {children}
    &#x25bc;
  </a>
))


const ArchiveFilter = () => {
  const history = useHistory()
  const [tree, setTree] = useState(QbUtils.loadTree(defaultTree))
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [filter, setFilter] = useState({
    display: '',
    queryString: '',
    groupBy: Constants.GROUP_BY_SELECTIONS[0]
  })
  const [buttonActive, setButtonActive] = useState(true)
  const distinctValues = useFetchRafael({ url: Constants.FILTER_ARCHIVE_DISTINCT }, [])[1]
  const [isLoading, queryResults] = useFetchRafael(getArchiveFilterParams(filter.queryString, filter.groupBy), [])
  const config = getConfig(distinctValues)
  const deletedFilter = ' NOT fieldtests_archive.is_deleted '

  const createNewQuery = () => {
    const newQuery = QbUtils.sqlFormat(tree, config) || ''
    let display = ''
    let queryString = ''
    display = queryStringConverter(newQuery)
    queryString = newQuery
    if (!includeDeleted) {
      queryString = (queryString !== '') ? `( ${queryString} ) AND (${deletedFilter} ) ` : deletedFilter
    }
    setFilter(prevState => ({ ...prevState, display, queryString }))
  }

  useEffect(() => {
    createNewQuery()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree, includeDeleted])

  useEffect(() => {
    setButtonActive(true)
  }, [filter.queryString, filter.groupBy])


  const renderBuilder = builderProps => (
    <div className="query-builder-container">
      <div className="query-builder qb-lite">
        <Builder {...builderProps} />
      </div>
    </div>
  )

  const dropItems = _.map(Constants.GROUP_BY_SELECTIONS, groupName => <Dropdown.Item eventKey={groupName} key={shortid.generate()}>{labelCase(groupName)}</Dropdown.Item>)
  const getGroupByLabel = (filter.groupBy !== 'archive') ? labelCase(filter.groupBy) : 'Archive'
  const groupBySelector = (
    <Dropdown onSelect={newGroup => setFilter(prevState => ({ ...prevState, groupBy: newGroup }))}>
      <Form.Check type="checkbox" label="Include Deleted" onChange={(e) => { setIncludeDeleted(e.target.checked) }} />
      <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
        {`Group By: ${getGroupByLabel}`}
      </Dropdown.Toggle>
      <Dropdown.Menu as={CustomMenu}>
        {dropItems}
      </Dropdown.Menu>
    </Dropdown>

  )

  const handleSearch = () => {
    setButtonActive(false)
    history.replace(`/search?queryString=${filter.queryString}&groupBy=${filter.groupBy}`)
  }

  return (
    <>
      <Query
        {...config}
        value={tree}
        onChange={setTree}
        renderBuilder={renderBuilder}
      />
      <div className="query-builder-result">
        <div style={{ padding: '0px 20px 0px 20px' }}>
          {(filter.display === '') ? null : (
            <Alert variant="info">
              {filter.display}
            </Alert>
          )}
          <Row className='justify-content-center'>
            <Col lg={10} md={7} sm={5}>
              <Button size="lg" variant="success" block onClick={handleSearch} disabled={!buttonActive}>{isLoading ? 'Loading' : `${size(queryResults)} ${labelCase(filter.groupBy)}s found`}</Button>
            </Col>
            <Col>
              {groupBySelector}
            </Col>
          </Row>
        </div>
      </div>
    </>
  )
}

CustomMenu.propTypes = {
  children: PropTypes.any.isRequired,
  style: PropTypes.any.isRequired,
  className: PropTypes.any.isRequired,
  'aria-labelledby': PropTypes.any.isRequired
}
export default React.memo(ArchiveFilter)
