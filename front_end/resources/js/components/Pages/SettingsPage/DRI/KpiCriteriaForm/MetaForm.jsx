import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Icons } from '@tidbits/react-tidbits'
import { Button } from '@dx/continuum-button'
import CreatableSelect from  'react-select/creatable'
import { StatePanel } from '@dx/continuum-state-panel'

import { useFetchRafael } from '../../../../../hooks/fetchData'
import { KPI_MAPPING_API } from '../../../../../utilities/constants'
import { sendToServer, sortedByKey } from '../../../../../utilities/helpers'


const MetaForm = ({ technology, feature, setMeta, name, type, timeRange }) => {
  const [isLoading, fetchedKpi] = useFetchRafael({ url: `${KPI_MAPPING_API}${technology}/${feature}/${name}&${timeRange.value}` }, [])
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [prevMeta, setPrevMeta] = useState({})
  const [newMeta, setNewMeta] = useState({})
  const [isNewKpi, setIsNewKpi] = useState(true)
  const [isEdit, setIsEdit] = useState(false)
  const { errorMessage } = fetchedKpi

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const referenceKpi = fetchedKpi
      const referenceMeta = sortedByKey(referenceKpi.meta)
      setMeta(referenceMeta)
      setPrevMeta(JSON.parse(JSON.stringify(referenceMeta)))
      setNewMeta(JSON.parse(JSON.stringify(referenceMeta)))
      setIsNewKpi(false)
    } else if (!isLoading && errorMessage) {
      setMeta({})
    }
  }, [isLoading, fetchedKpi])

  const handleSelectMeta = (options, metaKey) => {
    const metaValues = options ? options.map(option => option.value) : []
    setNewMeta(prevState => sortedByKey({
      ...prevState,
      [metaKey]: metaValues
    }))
  }

  const handleAddMeta = () => {
    const metaName = prompt(`Please enter a name for the new field.`)
    if (metaName && !(metaName in newMeta)) {
      setNewMeta(prevState => sortedByKey({
        ...prevState,
        [metaName]: []
      }))
    }
  }

  const handleDeleteMeta = (metaKey) => {
    setNewMeta((prevState) => {
      const newState = JSON.parse(JSON.stringify(prevState))
      delete newState[metaKey]
      return newState
    })
  }

  const handleCancel = () => {
    setNewMeta(JSON.parse(JSON.stringify(prevMeta)))
    setIsEdit(false)
  }

  const handleEdit = () => {
    setIsEdit(true)
  }

  const handleSuccess = () => {
    setIsLoadingSave(false)
    setMeta(newMeta)
    setPrevMeta(newMeta)
    if (isNewKpi) setIsNewKpi(false)
    setIsEdit(false)
  }

  const handleSave = () => {
    setIsLoadingSave(true)
    if (isNewKpi) {
      const referenceKpi = {
        unique_name: `${name}&${timeRange.value}`,
        name,
        category: name,
        unit: '',
        criteria: {},
        date: timeRange.value,
        meta: newMeta
      }
      sendToServer(`${KPI_MAPPING_API}${technology}/${feature}`, referenceKpi, 'POST', handleSuccess)
    } else {
      sendToServer(
        `${KPI_MAPPING_API}${technology}/${feature}/${name}&${timeRange.value}/update_kpi`,
        { meta: newMeta },
        'PATCH',
        handleSuccess
      )
    }
  }

  return (
    <div style={{ marginBottom: '25px'}}>
      {Object.keys(newMeta).length === 0 && (
        <StatePanel message={`No ${type} present.`} suggestion="Please add new fields through the form." />
      )}
      {Object.entries(newMeta).map(([metaKey, metaValues]) => (
        <Row key={metaKey} style={{ marginBottom: '5px' }}>
          <Col style={{ maxWidth: '300px' }}>
            <div>{metaKey}</div>
          </Col>
          <Col>
            <CreatableSelect
              isMulti
              isDisabled={!isEdit}
              onChange={options => handleSelectMeta(options, metaKey)}
              value={metaValues.map(metaValue => ({ label: metaValue, value: metaValue }))}
              options={prevMeta[metaKey] && prevMeta[metaKey].map(metaValue => ({ label: metaValue, value: metaValue }))}
            />
          </Col>
          <Col style={{ maxWidth: '200px '}}>
            {isEdit && (
              <Icons.CloseIcon
                cursor="pointer"
                mt="10px"
                width="12px"
                height="12px"
                onClick={() => handleDeleteMeta(metaKey)}
              />
            )}
          </Col>
        </Row>
      ))}
      <Row style={{ marginTop: '15px' }}>
        {isEdit ? (
          <>
            <Col sm="9">
              <Button variant="primary" onClick={handleAddMeta} size="small">{`Add ${type}`}</Button>
            </Col>
            <Col style={{ maxWidth: '60px' }}>
              <Button variant="confirm" onClick={handleSave} size="small">Save</Button>
            </Col>
            <Col style={{ maxWidth: '75px' }}>
              <Button onClick={handleCancel} size="small">Cancel</Button>
            </Col>
          </>
        ) : (
          <>
            <Col>
              <Button onClick={handleEdit}>{`Edit ${type}`}</Button>
            </Col>
          </>
        )}
      </Row>
    </div>
  )
}

export default React.memo(MetaForm)
