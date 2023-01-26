import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Spinner, InlineSpinner } from '@tidbits/react-tidbits/Spinner'
import { Button } from '@dx/continuum-button'
import { Text, List, Icons } from '@tidbits/react-tidbits'
import CreatableSelect from 'react-select/creatable'
import Select from 'react-select'

import HelpTooltip from '../../../Widgets/HelpTooltip'
import { getFetchUrl, patchItems, updateTableGroup } from './helpers'
import { useFetchRafael } from '../../../../hooks/fetchData'
import { isEmpty } from '../../../../utilities/helpers'


const isValidName = name => name.match(/^[a-zA-Z_0-9]+$/)

const initializeTableGroup = groupName => ({
  log_names: [],
  group_name: groupName
})


const TableGroupForm = ({ technology }) => {
  const [isLoadingItems, items] = useFetchRafael({ url: getFetchUrl(technology).TABLE_MAPPING }, [])
  const [isLoadingValidTables, validTables] = useFetchRafael({ url: getFetchUrl(technology).TABLE }, [])
  const [selectedTableGroup, setSelectedTableGroup] = useState({})
  const [tableMapping, setTableMapping] = useState({})
  const [validLogNames, setValidLogNames] = useState([])
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const resetText = () => {
    if (error) setError('')
    if (message) setMessage('')
  }

  useEffect(() => {
    if (!isLoadingItems && !isLoadingValidTables) {
      const newTableMapping = {}
      items.forEach((item) => {
        const { name: group_name, tables } = item
        const log_names = tables.map(table => table.log_name)
        newTableMapping[group_name] = {
          group_name,
          log_names
        }
      })
      const newValidLogNames = validTables.map(validTable => validTable.log_name)
      setSelectedTableGroup({})
      setTableMapping(newTableMapping)
      setValidLogNames(newValidLogNames)
      resetText()
    }
  }, [isLoadingItems, isLoadingValidTables, items, validTables])

  const handleTableGroupSelect = (option) => {
    const { value: newTableGroup } = JSON.parse(JSON.stringify(option))
    if (newTableGroup instanceof Object) {
      setSelectedTableGroup(newTableGroup)
    } else if (isValidName(newTableGroup)) {
      setSelectedTableGroup(initializeTableGroup(newTableGroup))
    }
    resetText()
  }

  const handleSuccess = () => {
    setIsLoadingSave(false)
    setTableMapping(prevState => ({
      ...prevState,
      [selectedTableGroup.group_name]: JSON.parse(JSON.stringify(selectedTableGroup))
    }))
    setMessage('Successfully saved.')
  }

  const handleError = (errorMessage) => {
    setIsLoadingSave(false)
    setError(errorMessage)
  }

  const handleSave = () => {
    resetText()
    setIsLoadingSave(true)
    const { group_name } = selectedTableGroup
    if (group_name in tableMapping) {
      updateTableGroup(technology, tableMapping[group_name], selectedTableGroup, handleSuccess, handleError)
    } else {
      patchItems(selectedTableGroup, 'TABLE_MAPPING', technology, null, handleSuccess, handleError, 'POST')
    }
  }

  const handleLogNameSelect = (options) => {
    resetText()
    const newLogNames = options.map(option => option.value)
    setSelectedTableGroup(prevState => ({
      ...prevState,
      log_names: newLogNames
    }))
  }

  return (
    <Row>
      <Col>
        <Row className="justify-content-center sub-form-element" style={{ marginBottom: '25px' }}>
          <Text mt="6px" textStyle="h5Emph">
            Table Group
            <HelpTooltip content="Create a new table grouping by typing in your selection and pressing enter" title="Tip:" placement="bottom" />
          </Text>
          <Col sm="5">
            <CreatableSelect
              value={!isEmpty(selectedTableGroup) && { label: selectedTableGroup.group_name, value: selectedTableGroup }}
              placeholder={`Select a table group...`}
              onChange={handleTableGroupSelect}
              options={Object.keys(tableMapping).map(groupName => ({ label: groupName, value: tableMapping[groupName] }))}
            />
          </Col>
        </Row>
        {!isEmpty(selectedTableGroup) && (
          <div className="bordered">
            <Row className="sub-form-element">
              <Col>
                <Text textStyle="h5Reg" mb="5px">Log Names</Text>
                <Select
                  isMulti
                  isClearable={false}
                  value={selectedTableGroup.log_names.map(logName => ({ label: logName, value: logName }))}
                  placeholder="Select log names..."
                  onChange={handleLogNameSelect}
                  options={validLogNames.map(validLogName => ({ label: validLogName, value: validLogName }))}
                />
              </Col>
            </Row>
            <Row style={{ marginTop: '35px', marginLeft: '5px', marginBottom: '15px' }}>
              <Button variant="primary" onClick={handleSave}>Save</Button>
              <div className="form-message-text" style={{ marginLeft: '5px' }}>
                {isLoadingSave && <Text>Loading <InlineSpinner visible={true}/></Text>}
                {error !== '' && (
                  <div className="sub-error-text">
                    {`Something went wrong: ${error}`}
                  </div>
                )}
                {message !== '' && (
                  <div className="sub-message-text">
                    {message}
                  </div>
                )}
              </div>
            </Row>
          </div>
        )}
        <Spinner visible={isLoadingItems || isLoadingValidTables} />
      </Col>
    </Row>
  )
}

export default React.memo(TableGroupForm)
