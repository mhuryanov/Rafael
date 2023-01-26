/* eslint-disable react/prop-types */
import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  Row, Col
} from 'react-bootstrap'
import { SelectDropdown } from '@dx/continuum-select-dropdown'

import { useFetchRafaelMulti } from '../../../hooks/fetchData'
import { ARCHIVE_META_API, DEFAULT_META_KEYS } from '../../../utilities/constants'
import { SetFeatureContext } from './FeatureContext'

const _ = require('underscore')


const getMetaKeys = (technology, feature) => {
  switch (true) {
    case technology === 'GNSS' && feature === 'TTFF':
      return ['Carrier']
    case technology === 'CLX' && feature === 'GEOFENCING':
      return ['Placement', 'Carrier', 'User', 'Instruction']
    default:
      return DEFAULT_META_KEYS
  }
}


const MetaKeySelection = ({
  technology,
  feature,
  archives,
}) => {
  const archiveIds = archives.map(archive => archive.id)
  const [isLoading, metaList] = useFetchRafaelMulti(archiveIds.map(id => ({ url: `${ARCHIVE_META_API}${id}` })), [])
  const setFeatureState = useContext(SetFeatureContext)
  const [allMetaKeys, setAllMetaKeys] = useState([])
  const [metaKeys, setMetaKeys] = useState(getMetaKeys(technology, feature))
  const { errorMessage } = metaList

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const metaMapping = {}
      const newAllMetaKeys = []
      metaList.forEach((meta, i) => {
        const { user: userMeta } = meta
        newAllMetaKeys.push(...Object.keys(userMeta))
        const archiveId = archiveIds[i]
        metaMapping[archiveId] = userMeta
      })
      setAllMetaKeys(_.uniq(newAllMetaKeys))
      setFeatureState(prevState => ({ ...prevState, metaMapping, metaKeys }))
    }
  }, [isLoading, errorMessage, metaList])

  useEffect(() => {
    setFeatureState(prevState => ({ ...prevState, metaKeys }))
  }, [metaKeys])

  const handleSelectMetaKeys = (options) => {
    const values = options ? options.map(option => option.value) : []
    setMetaKeys(values)
  }

  console.log('Rendering MetaKeySelection')
  return (
    <Col style={{ marginTop: '18px', minWidth: '1000px' }}>
      <SelectDropdown
        isMulti
        onChange={handleSelectMetaKeys}
        value={metaKeys.map(key => ({ value: key, label: key }))}
        options={allMetaKeys.map(key => ({ value: key, label: key }))}
      />
    </Col>
  )
}

MetaKeySelection.propTypes = {
  archives: PropTypes.array.isRequired
}

export default React.memo(MetaKeySelection)
