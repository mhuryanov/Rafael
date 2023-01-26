import React, { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { Text } from '@tidbits/react-tidbits'
import { DataGrid, DataGridRow, DataGridColumn } from '@dx/continuum-data-grid'
import { Button } from '@dx/continuum-button'
import { Input } from '@dx/continuum-input'
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter
} from '@dx/continuum-modal'

import { getFetchUrl, patchItems, formatItems } from './helpers'
import { useFetchRafael } from '../../../../hooks/fetchData'

const shortid = require('shortid')


const SegmentMappingModal = ({ isOpen, handleClose, segment, segmentMapping, env, technology, feature, callBack }) => {
  return (
    <div className="segment-modal">
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalContent>
          {isOpen && <SegmentEditForm
            segment={segment}
            segmentMapping={segmentMapping}
            env={env}
            technology={technology}
            feature={feature}
            handleClose={handleClose}
            callBack={callBack}
          />}
        </ModalContent>
      </Modal>
    </div>
  )
}

const SegmentEditForm = ({ segment, segmentMapping, env, technology, feature, handleClose, callBack }) => {
  const [dataToSave, setDataToSave] = useState([segment, env])
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleError = (errorMessage) => {
    setIsLoading(false)
    setError(errorMessage)
  }

  const handleSuccess = (newSegmentMapping) => {
    setIsLoading(false)
    callBack(newSegmentMapping)
    handleClose()
  }

  const handleSave = () => {
    setIsLoading(true)
    const [newSegment, newEnv] = dataToSave
    if (!newSegment || !newEnv) {
      handleError('Fields cannot be blank')
    } else if (newSegment in segmentMapping && newSegment !== segment) {
      handleError('Please choose a unique segment name.')
    } else if (!(segment in segmentMapping) || (newSegment === segment && newEnv !== env)) {
      const newSegmentMapping = { ...segmentMapping, [newSegment]: newEnv }
      patchItems(newSegmentMapping, 'SEGMENT', technology, feature, () => handleSuccess(newSegmentMapping), handleError, 'POST')
    } else if (newSegment !== segment) {
      const newSegmentMapping = JSON.parse(JSON.stringify({ ...segmentMapping, [newSegment]: newEnv }))
      delete newSegmentMapping[segment]
      patchItems(newSegmentMapping, 'SEGMENT', technology, feature, () => handleSuccess(newSegmentMapping), handleError, 'POST')
    } else {
      handleError('Segment mapping is invalid.')
    }
  }

  const handleDelete = () => {
    setIsLoading(true)
    const newSegmentMapping = JSON.parse(JSON.stringify(segmentMapping))
    delete newSegmentMapping[segment]
    patchItems(newSegmentMapping, 'SEGMENT', technology, feature, () => handleSuccess(newSegmentMapping), handleError, 'POST')
  }

  const handleShowConfirm = () => {
    setShowConfirm(prevShowConfirm => !prevShowConfirm)
  }

  const handleSegmentEdit = (e) => {
    const newSegment = e.target.value.toUpperCase()
    setDataToSave((prevDataToSave) => {
      const newDataToSave = prevDataToSave.slice()
      newDataToSave[0] = newSegment
      return newDataToSave
    })
    if (error !== '') setError('')
  }
  
  const handleEnvEdit = (e) => {
    const newEnv = (
      e.target.value.length === 1
        ? e.target.value.toUpperCase()
        : e.target.value
    )
    const isValidInput = (
      newEnv.length <= 1
        ? newEnv.match(/^[A-Z]*$/)
        : newEnv.match(/^[A-Z][A-Za-z0-9\-]+$/)
    )
    if (isValidInput) {
      setDataToSave((prevDataToSave) => {
        const newDataToSave = prevDataToSave.slice()
        newDataToSave[1] = newEnv
        return newDataToSave
      })
      if (error !== '') setError('')
    }
  }

  return (
    <div className="segment-modal-content">
      <Row className="justify-content-center">
        <Col lg="8" md="8" sm="8">
          <div>Segment Name</div>
          <Input invalid={error !== ''} disabled={showConfirm} value={dataToSave[0]} placeholder="Add segment..." onChange={handleSegmentEdit} />
        </Col>
      </Row>
      <Row className="justify-content-center" style={{ marginTop: '30px', marginBottom: '50px' }}>
        <Col lg="8" md="8" sm="8">
          <div>Signal Environment</div>
          <Input invalid={error !== ''} disabled={showConfirm} value={dataToSave[1]} placeholder="Add environment..." onChange={handleEnvEdit} />
          {error !== '' && (
            <div className="sub-error-text">
              {`Something went wrong: ${error}`}
            </div>
          )}
        </Col>
      </Row>
      {!showConfirm ? (
        <Row className="justify-content-center">
          <Button style={{ marginRight: '15px' }} variant="confirm" size="small" onClick={(e) => handleSave()}>Save</Button>
          {segment !== '' && <Button style={{ marginRight: '15px' }} variant="danger" size="small"  onClick={handleShowConfirm}>Delete</Button>}
          <Button variant="default" size="small" onClick={() => handleClose()}>Cancel</Button>
        </Row>
      ) : ( 
        <>
          <Row className="justify-content-center">
            <Text style={{ marginTop: '-10px', marginBottom: '10px' }}>
              {`Are you sure you want to delete ${segment}: ${env}?`}
            </Text>
          </Row>
          <Row className="justify-content-center" style={{ paddingBottom: '10px' }}>
            <Button style={{ marginRight: '15px' }} variant="danger" size="small" onClick={handleDelete}>Confirm</Button>
            <Button style={{ marginRight: '15px' }} variant="default" size="small" onClick={handleShowConfirm}>Cancel</Button>
          </Row>
        </>
      )}
      <Spinner visible={isLoading} />
    </div>
  )
}


const initialState = {
  allEnvs: [],
  allSegments: [],
  tableData: [],
  selectedSegment: null,
  selectedEnv: null
}

const SegmentMappingForm = ({ technology, feature }) => {
  const type = 'Segment'
  const typeKey = type.toUpperCase()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formState, setFormState] = useState(initialState)
  const [isLoading, fetchedItems] = useFetchRafael({ url: getFetchUrl(technology, feature)[typeKey] }, [])
  const {
    segmentMapping,
    tableData,
    selectedSegment,
    selectedEnv
  } = formState

  const callBack = (newSegmentMapping) => {
    setFormState((prevState) => {
      const newAllSegments = Object.keys(newSegmentMapping)
      const newAllEnvs = Object.values(newSegmentMapping)
      const newTableData = []
      newAllSegments.forEach((segment, idx) => {
        const env = newAllEnvs[idx]
        newTableData[idx] = {
          'Segment Name': segment,
          'Signal Environment': env,
          ' ': <Button variant="default" size="small" onClick={(e) => handleEdit(segment, env)}>Edit</Button>
        }
      })
      newTableData.sort((a, b) => a['Segment Name'] > b['Segment Name'])
      return {
        ...prevState,
        segmentMapping: newSegmentMapping,
        tableData: newTableData
      }
    })
  }

  useEffect(() => {
    if (!isLoading) {
      const newSegmentMapping = formatItems(fetchedItems, typeKey)
      callBack(newSegmentMapping)
    }
  }, [isLoading, fetchedItems])


  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleEdit = (segment, env) => {
    setFormState(prevState => ({
      ...prevState,
      selectedSegment: segment,
      selectedEnv: env
    }))
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setFormState(prevState => ({
      ...prevState,
      selectedSegment: '',
      selectedEnv: ''
    }))
    setIsModalOpen(true)
  }

  console.log('Rendering SegmentMappingForm')
  return (
    <Col>
      <Text textStyle="h5Regular">{`Segment Mapping for ${technology} ${feature}`}</Text>
      <div style={{ maxWidth: '60%' }}>
        <DataGrid
          data={tableData}
        >
          <DataGridRow>
            <DataGridColumn field={"Segment Name"} />
            <DataGridColumn field={"Signal Environment"} />
            <DataGridColumn field={" "} />
          </DataGridRow>
        </DataGrid>
      </div>
      <Button variant="primary" onClick={handleAdd}>Add</Button>
      <SegmentMappingModal
        isOpen={isModalOpen}
        handleClose={handleModalClose}
        segment={selectedSegment}
        segmentMapping={segmentMapping}
        env={selectedEnv}
        technology={technology}
        feature={feature}
        callBack={callBack}
      />
      <Spinner visible={isLoading} />
    </Col>
  )
}

export default React.memo(SegmentMappingForm)
