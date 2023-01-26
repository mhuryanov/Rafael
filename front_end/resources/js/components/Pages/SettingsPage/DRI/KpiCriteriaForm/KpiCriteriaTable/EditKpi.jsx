import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Text, Icons, Button } from '@tidbits/react-tidbits'
import {
  Modal,
  ModalHeader,
  ModalContent
} from '@dx/continuum-modal'
import { Input } from '@dx/continuum-input'
import Select from 'react-select'

import { KPI_MAPPING_API, COMPARE } from '../../../../../../utilities/constants'
import { sendToServer, isEmpty } from '../../../../../../utilities/helpers'

const shortid = require('shortid')

const getMeta = (metaValue, metaKeys) => {
  const meta = {}
  if (metaValue) {
    const values = metaValue.split('&')
    metaKeys.forEach((metaKey, i) => {
      const value = values[i]
      meta[metaKey.toLowerCase()] = value
    })
  }
  return meta
}

const getUniqueName = (category, name, metaValue, timeRange) => {
  if (metaValue) return `${category}&${name}&${metaValue}&${timeRange.value}`
  return `${category}&${name}&${timeRange.value}`
}

const EditKpiForm = ({ criteria, callBack, handleClose, error, setError }) => {
  const { target = '', nte = '', operator = '' } = criteria
  const [newCriteria, setNewCriteria] = useState({
    target,
    nte,
    operator
  })

  const handleTargetInput = (e) => {
    const { value } = e.target
    if (value.match(/^[0-9\.]*$/)) {
      if (Number(value) > Number(newCriteria.nte)) {
        setNewCriteria(prevCriteria => ({
          ...prevCriteria,
          target: value,
          operator: '<'
        }))
      } else if (Number(value) < Number(newCriteria.nte)) {
        setNewCriteria(prevCriteria => ({
          ...prevCriteria,
          target: value,
          operator: '>'
        }))
      } else {
        setNewCriteria(prevCriteria => ({
          ...prevCriteria,
          target: value
        }))
      }
    }
  }

  const handleNteInput = (e) => {
    const { value } = e.target
    if (value.match(/^[0-9\.]*$/)) {
      if (Number(value) > Number(newCriteria.target)) {
        setNewCriteria(prevCriteria => ({
          ...prevCriteria,
          nte: value,
          operator: '>'
        }))
      } else if (Number(value) < Number(newCriteria.target)) {
        setNewCriteria(prevCriteria => ({
          ...prevCriteria,
          nte: value,
          operator: '<'
        }))
      } else {
        setNewCriteria(prevCriteria => ({
          ...prevCriteria,
          nte: value
        }))
      }
    }
  }

  const handleOperatorSelect = (option) => {
    const { value } = option
    setNewCriteria(prevCriteria => ({
      ...prevCriteria,
      operator: value
    }))
  }

  return (
    <>
      <Row className="justify-content-center">
        <Col style={{ margin: '15px', maxWidth: '250px' }}>
          <Text mb="3px">Target</Text>
          <Input
            autoFocus
            placeholder="Enter target value..."
            value={newCriteria.target}
            onChange={handleTargetInput}
          />
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col style={{ margin: '15px', maxWidth: '250px' }}>
          <Text mb="3px">Not to Exceed</Text>
          <Input
            disabled={!newCriteria.target}
            placeholder="Enter NTE value..."
            value={newCriteria.nte}
            onChange={handleNteInput}
          />
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col style={{ margin: '15px', maxWidth: '150px' }}>
          <Text mb="3px">Operator</Text>
          <Select
            isDisabled={newCriteria.nte && newCriteria.nte !== newCriteria.target}
            onChange={handleOperatorSelect}
            options={Object.keys(COMPARE).map(op => ({ label: op, value: op }))}
            value={newCriteria.operator && { label: newCriteria.operator, value: newCriteria.operator }}
            placeholder="Select..."
          />
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Button
          primary
          mr="15px"
          disabled={!newCriteria.target || !newCriteria.operator}
          onClick={() => callBack(newCriteria)}
        >
          Save
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </Row>
    </>
  )
}

const EditKpiModal = ({
  isOpen, handleClose, title, criteria, callBack, error, setError
}) => {
  return (
    <div className="segment-modal">
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalHeader>
          {title}
        </ModalHeader>
        <ModalContent>
          {isOpen && (
            <EditKpiForm
              criteria={criteria}
              callBack={callBack}
              handleClose={handleClose}
              error={error}
              setError={setError}
            />
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

const EditKpi = ({
  technology, feature, metaValue, metaKeys,
  category, name, criteria, timeRange, reset
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState('')

  const handleSuccess = () => {
    reset(shortid.generate())
    setIsModalOpen(false)
  }

  const handleSave = ({ target, nte, operator }) => {
    const isExisting = !isEmpty(criteria)
    const uniqueName = getUniqueName(category, name, metaValue, timeRange)
    if (!isExisting) {
      const newKpi = {
        unique_name: uniqueName,
        name,
        category,
        unit: '',
        criteria: { target, nte, operator },
        date: timeRange.value,
        meta: getMeta(metaValue, metaKeys)
      }
      sendToServer(
        `${KPI_MAPPING_API}${technology}/${feature}`,
        newKpi,
        'POST',
        handleSuccess
      )
    } else {
      const url = encodeURI(`${KPI_MAPPING_API}${technology}/${feature}/${uniqueName}/update_kpi`)
      sendToServer(
        url,
        { criteria: { target, nte, operator } },
        'PATCH',
        handleSuccess
      )
    }
  }

  console.log('Rendering EditKpi')
  return (
    <> 
      <div className="clickable-icon" onClick={() => setIsModalOpen(true)}>
        <Icons.ComposeIcon width="10px" height="10px" />
      </div>
      {isModalOpen && (
        <EditKpiModal
          isOpen={isModalOpen}
          handleClose={() => setIsModalOpen(false)}
          criteria={criteria}
          callBack={handleSave}
          error={error}
          setError={setError}
          title={`${metaValue.split('&').join(', ')} - ${category}, ${name}`}
        />
      )}
    </>
  )
}

export default React.memo(EditKpi)
