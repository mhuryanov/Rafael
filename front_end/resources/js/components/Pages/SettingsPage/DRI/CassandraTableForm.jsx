import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Spinner, InlineSpinner } from '@tidbits/react-tidbits/Spinner'
import { Button } from '@dx/continuum-button'
import { Input } from '@dx/continuum-input'
import { DataGrid, DataGridRow, DataGridColumn } from '@dx/continuum-data-grid'
import { Text, List, Icons } from '@tidbits/react-tidbits'
import { SelectDropdown } from '@dx/continuum-select-dropdown'
import CreatableSelect from 'react-select/creatable'
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter
} from '@dx/continuum-modal'

import HelpTooltip from '../../../Widgets/HelpTooltip'
import { getFetchUrl, updateTable, createTable } from './helpers'
import { useFetchRafael } from '../../../../hooks/fetchData'
import { isEmpty } from '../../../../utilities/helpers'

const LOG_TYPES = [
  'REPORT',
  'SHARE_LOG'
]

const COLUMN_TYPES = [
  'Ascii', 'Bigint', 'Blob', 'Boolean', 'Date', 'Decimal', 'Double',
  'Float', 'Int', 'List', 'Map', 'Set', 'Smallint', 'Text', 'Time',
  'Timestamp', 'Timeuuid', 'Tinyint', 'Tuple', 'Uuid'
]

const isValidName = name => (
  name.length <= 1
    ? name.match(/^[a-z]*$/)
    : name.match(/^[a-z_0-9]+$/)
)

const initializeTable = (logName, technology) => ({
  log_name: logName,
  table_name: '',
  keyspace: 'keylime_prod',
  log_type: 'REPORT',
  technology,
  is_locked: false,
  columns: [],
  primary_keys: []
})

const CassandraModal = ({ isOpen, handleClose, callBack }) => {
  return (
    <div className="segment-modal">
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalContent>
          {isOpen && (
            <CassandraColumnForm
              handleClose={handleClose}
              callBack={callBack}
            />
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

const CassandraColumnForm = ({ handleClose, callBack }) => {
  const [columnName, setColumnName] = useState('')
  const [columnType, setColumnType] = useState('')
  const [error, setError] = useState('')

  const handleChange = (option, type) => {
    const { value } = option
    switch (type) {
      case 'columnName':
        if (isValidName(value)) setColumnName(value)
        break
      case 'columnType':
        setColumnType(value)
        break
      default:
    }
    if (error) setError('')
  }

  const handleSave = () => {
    if (columnName && columnType) {
      callBack(columnName, columnType)
      handleClose()
    } else {
      setError('Fields cannot be empty')
    }
  }

  return (
    <div className="segment-modal-content">
      <Row className="justify-content-center">
        <Col lg="8" md="8" sm="8">
          <div>Column Name</div>
          <Input
            value={columnName}
            placeholder="Add Column Name"
            onChange={event => handleChange(event.target, 'columnName')}
          />
        </Col>
      </Row>
      <Row className="justify-content-center" style={{ marginTop: '30px', marginBottom: '50px' }}>
        <Col lg="8" md="8" sm="8">
          <div>Column Type</div>
          <SelectDropdown
            value={columnType && { label: columnType, value: columnType }}
            placeholder="Select Column Type..."
            onChange={option => handleChange(option, 'columnType')}
            options={COLUMN_TYPES.map(colType => ({ label: colType, value: colType }))}
          />
          {error !== '' && (
            <div className="sub-error-text">
              {`${error}`}
            </div>
          )}
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Button style={{ marginRight: '15px' }} variant="confirm" size="small" onClick={handleSave}>Save</Button>
        <Button variant="default" size="small" onClick={() => handleClose()}>Cancel</Button>
      </Row>
    </div>
  )
}

const CassandraTableForm = ({ technology, driTechnologies }) => {
  const [isLoadingItems, items] = useFetchRafael({ url: getFetchUrl(technology).TABLE }, [])
  const [selectedTable, setSelectedTable] = useState({})
  const [allTables, setAllTables] = useState({})
  const [showColumnModal, setShowColumnModal] = useState(false)
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const isDisabled = selectedTable.log_type === 'SHARE_LOG' // not supported yet

  const resetText = () => {
    if (error) setError('')
    if (message) setMessage('')
  }

  useEffect(() => {
    if (!isLoadingItems) {
      const newTables = {}
      items.forEach((item) => {
        newTables[item.log_name] = item
      })
      setSelectedTable({})
      setAllTables(newTables)
      resetText()
    }
  }, [isLoadingItems, items])

  const handleTableSelect = (option) => {
    const { value: newTable } = JSON.parse(JSON.stringify(option))
    if (newTable instanceof Object) {
      setSelectedTable(newTable)
    } else if (isValidName(newTable)) {
      setSelectedTable(initializeTable(newTable, technology))
    }
    resetText()
  }

  const handleSuccess = () => {
    setIsLoadingSave(false)
    setAllTables(prevAllTables => ({
      ...prevAllTables,
      [selectedTable.log_name]: JSON.parse(JSON.stringify(selectedTable))
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
    const { log_name } = selectedTable
    if (log_name in allTables) {
      updateTable(allTables[log_name], selectedTable, handleSuccess, handleError)
    } else {
      createTable(selectedTable, handleSuccess, handleError)
    }
  }

  const handleColumnSave = (columnName, columnType) => {
    resetText()
    setSelectedTable((prevState) => {
      const { columns } = prevState
      const newColumn = {
        column_name: columnName,
        column_type: columnType,
        is_primary_key: false
      }
      columns.push(newColumn)
      return {
        ...prevState,
        columns
      }
    })
  }

  return (
    <Row>
      <Col>
        <Row className="justify-content-center sub-form-element" style={{ marginBottom: '25px' }}>
          <Text mt="6px" textStyle="h5Emph">
            Log Name
            <HelpTooltip content="Create a new log name by typing in your selection and pressing enter" title="Tip:" placement="bottom" />
          </Text>
          <Col sm="5">
            <CreatableSelect
              value={!isEmpty(selectedTable) && { label: selectedTable.log_name, value: selectedTable }}
              placeholder={`Select a log name...`}
              onChange={handleTableSelect}
              options={Object.keys(allTables).map(log => ({ label: log, value: allTables[log] })).sort((a, b) => a.label > b.label)}
            />
          </Col>
        </Row>
        {!isEmpty(selectedTable) && (
          <div className="bordered">
            <Row className="sub-form-element">
              <Col sm="2">
                <Text mt="3px">
                  Table Name
                </Text>
              </Col>
              <Col sm="6">
                <Input
                  invalid={error !== ''}
                  value={selectedTable.table_name}
                  placeholder="Add table name..."
                  onChange={(event) => {
                    const { value: newTableName } = event.target
                    if (isValidName(newTableName)) {
                      resetText()
                      setSelectedTable(prevState => ({ ...prevState, table_name: newTableName }))
                    }
                  }}
                />
              </Col>
            </Row>
            <Row className="sub-form-element">
              <Col sm="2">
                <Text mt="3px">
                  Log Type
                  {isDisabled && <Icons.LockIcon ml="3px" height="15px" width="15px" />}
                </Text>
              </Col>
              <Col sm="6">
                <SelectDropdown
                  disabled={isDisabled}
                  value={selectedTable.log_type && { label: selectedTable.log_type, value: selectedTable.log_type }}
                  placeholder="Select log type..."
                  onChange={(option) => {
                    const { value: newLogType } = option
                    resetText()
                    setSelectedTable(prevState => ({ ...prevState, log_type: newLogType }))
                  }}
                  options={LOG_TYPES.map(logType => ({ label: logType, value: logType }))}
                />
              </Col>
            </Row>
            <Row className="sub-form-element">
              <Col sm="2">
                <Text mt="3px">
                  Technology
                  {isDisabled && <Icons.LockIcon ml="3px" height="15px" width="15px" />}
                </Text>
              </Col>
              <Col sm="6">
                <SelectDropdown
                  disabled={isDisabled}
                  value={selectedTable.technology && selectedTable.technology !== 'None' && { label: selectedTable.technology, value: selectedTable.technology }}
                  placeholder="Select technology..."
                  onChange={(option) => {
                    const { value: newTechnology } = option
                    resetText()
                    setSelectedTable(prevState => ({ ...prevState, technology: newTechnology }))
                  }}
                  options={driTechnologies.map(tech => ({ label: tech, value: tech }))}
                />
              </Col>
            </Row>
            <Row className="sub-form-element">
              <Col sm="2">
                <Text mt="3px">
                  Primary Keys
                  {(isDisabled || selectedTable.is_locked) && <Icons.LockIcon ml="3px" height="15px" width="15px" />}
                </Text>
              </Col>
              <Col sm="6">
                <SelectDropdown
                  isMulti
                  disabled={isDisabled || selectedTable.is_locked}
                  value={selectedTable.primary_keys.map(primaryKey => ({ label: primaryKey, value: primaryKey }))}
                  placeholder="Select primary keys..."
                  onChange={(options) => {
                    const newPrimaryKeys = options.map(option => option.value)
                    resetText()
                    setSelectedTable(prevState => ({ ...prevState, primary_keys: newPrimaryKeys }))
                  }}
                  options={selectedTable.columns.map(column => ({ label: column.column_name, value: column.column_name }))}
                />
              </Col>
            </Row>
            <Row className="sub-form-element" style={{ marginRight: '5px', marginLeft: '5px' }}>
              <DataGrid
                pageSize={10}
                data={selectedTable.columns ? selectedTable.columns.map(column => ({
                  'Column Name': <div style={{ color: selectedTable.primary_keys.includes(column.column_name) ? 'blue' : 'black' }}>{column.column_name}</div>,
                  'Column Type': column.column_type,
                  'Search': column.column_name
                })) : []}
              >
                <DataGridRow>
                  <DataGridColumn field={"Column Name"} />
                  <DataGridColumn field={"Column Type"} />
                </DataGridRow>
              </DataGrid>
              <Button onClick={() => setShowColumnModal(true)}>Add New Column</Button>
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
            {showColumnModal && <CassandraModal isOpen={showColumnModal} handleClose={() => setShowColumnModal(false)} callBack={handleColumnSave} />}
          </div>
        )}
        <Spinner visible={isLoadingItems} />
      </Col>
    </Row>
  )
}

export default React.memo(CassandraTableForm)
