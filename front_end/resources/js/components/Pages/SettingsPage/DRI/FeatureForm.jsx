import React, {useEffect, useState, useContext} from 'react'
import { Col, Row, Form, Alert } from 'react-bootstrap'
import { Spinner, InlineSpinner } from '@tidbits/react-tidbits/Spinner'
import { List, Text } from '@tidbits/react-tidbits'
import { Input } from '@dx/continuum-input'
import { Button } from '@dx/continuum-button'
import { Badge } from '@dx/continuum-badge'

import { patchItems } from './helpers'
import { StateContext, SetStateContext } from '../../../StateContext'

const FeatureForm = ({ technology }) => {
  const typeKey = 'FEATURE'
  const { technologyFeatures } = useContext(StateContext)
  const { [technology]: features } = technologyFeatures
  const setContextState = useContext(SetStateContext)
  const [featureToAdd, setFeatureToAdd] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleError = (errorMessage) => {
    setIsLoading(false)
    setError(errorMessage)
  }

  const handleSuccess = () => {
    setContextState((prevState) => {
      const newTechnologyFeatures = JSON.parse(JSON.stringify(prevState.technologyFeatures))
      const newFeatures = newTechnologyFeatures[technology]
        .concat(featureToAdd)
        .sort()
      newTechnologyFeatures[technology] = newFeatures
      return {
        ...prevState,
        technologyFeatures: newTechnologyFeatures
      }
    })
    setFeatureToAdd('')
    setIsLoading(false)
  }

  const handleAdd = () => {
    const isConfirmed = confirm(`Are you sure you want to add ${featureToAdd}?`)
    if (isConfirmed) {
      setIsLoading(true)
      if (features.includes(featureToAdd)) {
        handleError('Please choose a unique feature name')
      } else {
        patchItems(featureToAdd, typeKey, technology, null, handleSuccess, handleError)
      }
    }
  }

  const handleInput = (e) => {
    const newFeature = e.target.value.toUpperCase()
    const isValidInput = (
      newFeature.length <= 1
        ? newFeature.match(/^[A-Z]*$/)
        : newFeature.match(/^[A-Z][A-Z0-9\-]+$/)
    )
    if (isValidInput) {
      setFeatureToAdd(newFeature)
    }
  }

  console.log('Rendering FeatureForm')
  return (
    <Col className="feature-form-container">
      <Row className="feature-form-badge-container">
        {features.map(feature => (
          <div className="feature-badge" key={technology + feature}>
            <Badge variant="primary">{feature}</Badge>
          </div>
        ))}
      </Row>
      <Row style={{ marginTop: '15px' }}>
        <Col sm="6" style={{ width: '200px' }}>
          <Input
            autoFocus
            invalid={error !== ''}
            value={featureToAdd}
            placeholder="Add feature..."
            onChange={handleInput}
          />
        </Col>
        <Col>
          <Button
            disabled={!featureToAdd}
            variant="primary"
            size="small"
            onClick={handleAdd}
          >
            Submit
          </Button>
        </Col>
      </Row>
      <div className="form-message-text">
        {isLoading && <Text>Loading <InlineSpinner visible={true}/></Text>}
        {error !== '' && (
          <div className="sub-error-text">
            {`Something went wrong: ${error}`}
          </div>
        )}
      </div>
    </Col>
  )
}

export default React.memo(FeatureForm)
