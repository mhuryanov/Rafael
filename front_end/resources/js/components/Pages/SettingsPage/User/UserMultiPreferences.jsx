import React from 'react'
import { Suspense, lazy } from 'react'
import { Col, Row, Form, Alert } from 'react-bootstrap'
import { Text } from '@tidbits/react-tidbits'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import UserPreferences from '../../../../utilities/UserPreferences'
import { useContext } from 'react'
import { StateContext } from '../../../StateContext'
import { getTechnologiesToShow, sortedByKey } from '../../../../utilities/helpers'

const Select = lazy(() => import('react-select'))


const UserMultiPreferences = ({ preferences, setPreferences, type, title }) => {
  const { technologyFeatures } = useContext(StateContext)
  const targetPrefs = preferences[type]
  const prefOptions = getTechnologiesToShow(targetPrefs).map(pref => ({
    value: pref,
    label: pref === 'R1' ? 'PROXIMITY' : pref
  }))
  const allPrefOptions = {
    technologyPreferences: Object.keys(technologyFeatures)
      .map(technology => ({
        value: technology,
        label: technology === 'R1' ? 'PROXIMITY' : technology
      }))
  }

  const handlePrefSelect = (options) => {
    setPreferences(prevPrefs => {
      const newPrefs = UserPreferences.deserialize(UserPreferences.serialize(prevPrefs))
      const newTargetPrefs = JSON.parse(JSON.stringify(newPrefs[type]))
      const selectedTechnologies = options ? options.map(option => option.value) : []
      Object.keys(newTargetPrefs).forEach((technology) => {
        if (selectedTechnologies.includes(technology)) newTargetPrefs[technology] = true
        else newTargetPrefs[technology] = false
      })
      newPrefs[type] = sortedByKey(newTargetPrefs)
      return newPrefs
    })
  }

  console.log('Rendering UserMultiPreferences')
  return (
    <Row>
      <Col className="form-element">
        <Text textStyle="h5Regular">{title}</Text>
        <div className="multi-select-body">
          <Suspense fallback={<Spinner visible />}>
            <Select
              backspaceRemovesValue={false}
              isClearable={false}
              isMulti
              value={prefOptions}
              onChange={handlePrefSelect}
              options={allPrefOptions[type]}
            />
          </Suspense>
        </div>
      </Col>
    </Row>
  )
}

export default React.memo(UserMultiPreferences)
