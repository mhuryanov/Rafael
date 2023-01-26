/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { useState, useEffect, lazy, Suspense } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { SelectDropdown } from '@dx/continuum-select-dropdown'
import { Button } from '@dx/continuum-button'
import CreatableSelect from 'react-select/creatable'
import {
  Modal,
  ModalHeader,
  ModalContent
} from '@dx/continuum-modal'
import { Icons } from '@tidbits/react-tidbits'

import { useFetchRafael } from '../../../hooks/fetchData'
import { TABLE_API } from '../../../utilities/constants'
import { createArchiveLabel } from '../../../utilities/helpers'

const PreviewTable = lazy(() => import('../../Tables/PreviewTable'))


const TablePreviewModal = ({ isOpen, handleClose, isLoading, tables, handleSubmit }) => {
  return (
    <div className="table-preview-modal">
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalHeader>Table Selection</ModalHeader>
        <ModalContent>
          {isOpen && <TablePreviewForm
            isLoading={isLoading}
            tables={tables}
            handleSubmit={handleSubmit}
          />}
        </ModalContent>
      </Modal>
    </div>
  )
}

const TablePreviewForm = ({ isLoading, tables, handleSubmit }) => {
  const [logName, setLogName] = useState('')
  const [allColumns, setAllColumns] = useState([])
  const [selectedColumns, setSelectedColumns] = useState([])

  const handleTableSelect = (option) => {
    const { value } = option
    const { log_name, columns } = value
    const columnNames = columns
      .map(column => column.column_name)
      .filter(columnName => columnName !== 'archive_uuid')
    setLogName(log_name)
    setAllColumns(columnNames)
    setSelectedColumns(columnNames)
  }

  const handleColumnSelect = (options) => {
    const newColumnNames = options.map(option => option.value)
    setSelectedColumns(newColumnNames)
  }

  return (
    <div style={{ margin: '25px' }}>
      <div style={{ margin: '15px' }}>
        <SelectDropdown
          onChange={handleTableSelect}
          placeholder="Select a log name..."
          options={tables.map(table => ({ value: table, label: table.log_name }))}
        />
      </div>
      <div style={{ margin: '15px' }}>
        <CreatableSelect
          isMulti
          disabled={logName === ''}
          placeholder="Select columns..."
          value={selectedColumns.map(column => ({ value: column, label: column }))}
          onChange={handleColumnSelect}
          options={allColumns.map(column => ({ value: column, label: column }))}
        />
        {/* {selectedColumns.length === 0 && (
          <div style={{ marginLeft: '3px' }} className="sub-message-text">
            Enter * to select all columns.
          </div>
        )} */}
      </div>
      <Row className="justify-content-center">
        <Button variant="primary" disabled={logName === '' || selectedColumns.length === 0} onClick={() => handleSubmit(logName, selectedColumns)}>Submit</Button>
      </Row>
      <Spinner visible={isLoading} />
  </div>
  )
}

const TablePreview = ({ archive }) => {
  const { id: archiveId, technology } = archive
  const { label: archiveLabel } = createArchiveLabel(archive)
  const [isLoading, fetchedTables] = useFetchRafael({ url: `${TABLE_API}by_technology/${technology}/` }, [])
  const [allTables, setAllTables] = useState([])
  const [tablesToShow, setTablesToShow] = useState([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setAllTables(fetchedTables)
    }
  }, [isLoading, fetchedTables])

  const handleModalClose = () => {
    setShowModal(false)
  }

  const handleSubmit = (logName, columns) => {
    setShowModal(false)
    if (tablesToShow.map(table => table.logName).includes(logName)) return
    const newTableToShow = {
      archiveId,
      logName,
      columns
    }
    setTablesToShow(prevTablesToShow => prevTablesToShow.concat(newTableToShow))
  }

  const handleDelete = (logName) => {
    setTablesToShow((prevTablesToShow) => {
      const newTablesToShow = JSON.parse(JSON.stringify(prevTablesToShow))
      const idx = newTablesToShow.map(table => table.logName).indexOf(logName)
      newTablesToShow.splice(idx, 1)
      return newTablesToShow
    })
  }

  return (
    <div style={{ marginTop: '15px' }}>
      <Button variant="primary" onClick={() => setShowModal(true)}>Add Table</Button>
      <Row>
        {tablesToShow.map(table => (
          <Col className="box" key={table.logName} style={{ minWidth: '800px' }}>
            <h1 className="plot-title" style={{ marginTop: '25px' }}>
              {table.logName}
              <span style={{ float: 'right' }}>
                <Icons.CloseIcon height="15px" width="15px" mt="-3px" color="error" onClick={() => handleDelete(table.logName)} cursor="pointer" />
              </span>
            </h1>
            <Suspense fallback={<Spinner visible />}>
              <PreviewTable archiveId={table.archiveId} archiveLabel={archiveLabel} columns={table.columns} logName={table.logName} />
            </Suspense>
          </Col>
        ))}
      </Row>
      <TablePreviewModal
        isOpen={showModal}
        handleClose={handleModalClose}
        isLoading={isLoading}
        tables={allTables}
        handleSubmit={handleSubmit}
      />
    </div>
  )
}

export default React.memo(TablePreview)
