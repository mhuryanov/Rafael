import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Text, Icons, Button } from '@tidbits/react-tidbits'
import { InlineSpinner } from '@tidbits/react-tidbits/Spinner'
import { TextArea } from '@tidbits/react-tidbits/Input'
import { Input } from '@dx/continuum-input'
import Select from 'react-select'
import { SegmentedButton } from '@dx/continuum-segmented-button'
import DatePicker from 'react-datepicker'
import CreatableSelect from 'react-select/creatable'
import { Checkbox } from '@dx/continuum-checkbox'

import { addLeadingZeroes, isEmpty, sendToServer } from '../../../utilities/helpers'
import { QUERY_KEY_MAPPING } from './constants'
import { TAG_RULES_API } from '../../../utilities/constants'

const _ = require('underscore')

const PRIORITY_VALUES = [
  -3,
  -2,
  -1,
  0,
  1,
  2,
  3
]

const QUERY_OPERATORS = [
  '__in',
  '__contains'
]

const customStyles = {
  control: base => ({
    ...base,
    height: 30,
    minHeight: 30,
    fontSize: '12px'
  })
}

const getQueryLabel = (queryKey) => {
  let label = queryKey
  QUERY_OPERATORS.forEach((op) => {
    if (queryKey.includes(op)) {
      label = queryKey.slice(0, queryKey.length - op.length)
    }
  })
  return label
}

const RulesEntry = ({ title, width = "125px", children }) => {
  return (
    <Row style={{ marginTop: '25px', marginBottom: '25px' }}>
      <Col style={{ minWidth: width, maxWidth: width }}>
        {title}
      </Col>
      <Col>
        {children}
      </Col>
    </Row>
  )
}


const RuleSideBar = ({ defaultRule, handleCancel, callBack }) => {
  const isNewRule = defaultRule.name === '_NEWRULE'
  const [rule, setRule] = useState(defaultRule)
  const [showOptions, setShowOptions] = useState(false)
  const [startDate, setStartDate] = useState(
    rule.enable_from
      ? new Date(Number(rule.enable_from.split('-')[0]), Number(rule.enable_from.split('-')[1] - 1, Number(rule.enable_from.split('-')[2])))
      : null
  )
  const [endDate, setEndDate] = useState(
    rule.enable_to
      ? new Date(Number(rule.enable_to.split('-')[0]), Number(rule.enable_to.split('-')[1] - 1, Number(rule.enable_to.split('-')[2])))
      : null
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleName = (e) => {
    let { value } = e.target
    if (value[0] !== '_') value = `_${value}`
    setRule(prevRule => ({
      ...prevRule,
      name: value.toUpperCase()
    }))
  }

  const handleQueryKey = (option, targetIndex) => {
    const { value: newValue } = option
    setRule((prevRule) => {
      const newQueries = {}
      Object.entries(prevRule.queries).forEach(([key, value], i) => {
        if (i === targetIndex) newQueries[newValue] = value
        else newQueries[key] = value
      })
      return {
        ...prevRule,
        queries: newQueries
      }
    })
  }

  const handleQueryValue = (e, targetIndex) => {
    const { value: newValue } = e.target
    setRule((prevRule) => {
      const newQueries = {}
      Object.entries(prevRule.queries).forEach(([key, value], i) => {
        if (i === targetIndex) newQueries[key] = newValue
        else newQueries[key] = value
      })
      return {
        ...prevRule,
        queries: newQueries
      }
    })
  }

  const handlePriority = (e) => {
    const { value } = e.target
    setRule(prevRule => ({
      ...prevRule,
      priority: value
    }))
  }

  const handleAddQuery = () => {
    setRule(prevRule => ({
      ...prevRule,
      queries: { ...prevRule.queries, '': '' }
    }))
  }

  const handleDelete = () => {
    const isApproved = confirm(`Are you sure you want to delete ${rule.name}?`)
    if (isApproved) {
      setIsLoading(true)
      const url = `${TAG_RULES_API}/${rule.id}`
      sendToServer(url, _.omit(rule, 'id'), 'DELETE', (payload) => {
        setIsLoading(false)
        callBack(payload, rule.id)
        handleCancel()
      }, (err) => {
        setIsLoading(false)
        alert(`Something went wrong ${err}. Please try again.`)
      })
    }
  }

  const handleSave = () => {
    if (rule.name == '_NEWRULE') {
      alert('Please enter valid tag name.')
      return
    }
    const url = (
      !isNewRule
        ? `${TAG_RULES_API}/${rule.id}`
        : `${TAG_RULES_API}`
    )
    const method = (
      !isNewRule
        ? 'PATCH'
        : 'POST'
    )
    setIsLoading(true)
    sendToServer(url, _.omit(rule, 'id'), method, (payload) => {
      setIsLoading(false)
      callBack(payload, rule.id)
      handleCancel()
    }, (err) => {
      setIsLoading(false)
      alert(`Something went wrong ${err}. Please try again.`)
    })
  }

  const handleDateChange = (date, key) => {
    if (key === 'enable_from') {
      setStartDate(date)
    } else if (key === 'enable_to') {
      setEndDate(date)
    }
    setRule(prevRule => ({
      ...prevRule,
      [key]: `${date.getFullYear()}-${addLeadingZeroes(date.getMonth() + 1)}-${addLeadingZeroes(date.getDate())}`
    }))
  }

  const handleComments = (e) => {
    const { value } = e.target
    setRule(prevRule => ({
      ...prevRule,
      comments: value
    }))
  }

  const handleCheck = () => {
    setRule(prevRule => ({
      ...prevRule,
      enabled: !prevRule.enabled
    }))
  }


  return (
    <div className="rules-sidebar">
      <div className="rules-sidebar-contents">
        <RulesEntry title="Tag Name:">
          <Input onChange={handleName} value={rule.name} />
        </RulesEntry>
        <RulesEntry title="Queries:">
          <Button onClick={handleAddQuery}>Add New Query</Button>
        </RulesEntry>
        <RulesEntry title="Enable">
          <Checkbox checked={rule.enabled} onChecked={handleCheck} />
        </RulesEntry>
        {Object.entries(rule.queries).map(([queryKey, queryValue], i) => (
          <RulesEntry
            key={i}
            title={(
              <>
                <Text m="3px">Key:</Text>
                <CreatableSelect
                  styles={customStyles}
                  value={{ label: getQueryLabel(queryKey), value: queryKey }}
                  onChange={option => handleQueryKey(option, i)}
                  options={Object.entries(QUERY_KEY_MAPPING).map(([key, val]) => ({ label: val, value: key }))}
                />
              </>
            )}
            width="400px"
          >
            {/* <Text m="3px">Operator:</Text>
            <Select
              styles={customStyles}
              value={{ }}
              onChange={option => handleQueryKey(option, i)}
              options={Object.entries(QUERY_KEY_MAPPING).map(([key, val]) => ({ label: val, value: key }))}
            /> */}
            <Text m="3px">Value:</Text>
            <Input onChange={e => handleQueryValue(e, i)} defaultValue={queryValue} />
          </RulesEntry>
        ))}
        <RulesEntry
          title={(
            <div className="clickable-icon" onClick={() => setShowOptions(prev => !prev)}>
              <span style={{ textDecoration: 'underline' }}>Optional Settings {showOptions ? <>&#9650;</> : <>&#9660;</>}</span>
            </div>
          )}
          width="250px"
        />
        {showOptions && (
          <>
            <RulesEntry title="Priority:">
              <select onChange={handlePriority}>
                {PRIORITY_VALUES.map(value => (
                  <option value={value} selected={value === rule.priority}>{value}</option>
                ))}
              </select>
            </RulesEntry>
            <RulesEntry title="Enable From">
              <DatePicker
                placeholderText="Select a start date"
                selected={startDate}
                onChange={date => handleDateChange(date, 'enable_from')}
                dateFormat="yyyy-MM-dd"
              />
            </RulesEntry>
            <RulesEntry title="Enable To">
              <DatePicker
                placeholderText="Select an end date"
                selected={endDate}
                onChange={date => handleDateChange(date, 'enable_to')}
                dateFormat="yyyy-MM-dd"
              />
            </RulesEntry>
            <RulesEntry title="Comments">
              <TextArea height="100px" value={rule.comments} onChange={handleComments} />
            </RulesEntry>
          </>
        )}
        <Row style={{ marginTop: '50px', marginLeft: '0px' }}>
          <Button
            primary
            mr="15px"
            onClick={() => handleSave(rule)}
          >
            Save
          </Button>
          <InlineSpinner visible={isLoading} />
          {!isNewRule && <Button primary variant="destructive" mr="15px" onClick={handleDelete}>Delete</Button>}
          <Button onClick={handleCancel}>Cancel</Button>
        </Row>
      </div>
    </div>
  )
}

export default React.memo(RuleSideBar)
