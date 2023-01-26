import React, { useEffect, useState, useContext } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import {
  Link,
  Redirect
} from 'react-router-dom'
import { Button } from '@dx/continuum-button'
import { Text } from '@tidbits/react-tidbits'
import { InlineSpinner } from '@tidbits/react-tidbits/Spinner'

import { StateContext, SetStateContext } from '../../../StateContext'
import UserPreferences from '../../../../utilities/UserPreferences'
import UserMultiPreferences from './UserMultiPreferences'
import UserSinglePreferences from './UserSinglePreferences'


const UserForm = () => {
  const { userPreferences } = useContext(StateContext)
  const setContextState = useContext(SetStateContext)
  const [preferences, setPreferences] = useState(userPreferences)
  const [isLoading, setIsLoading] = useState(false)
  const [isChanged, setIsChanged] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!UserPreferences.equals(userPreferences, preferences)) {
      if (!isChanged) setIsChanged(true)
    } else if (isChanged) setIsChanged(false)
  }, [userPreferences, preferences])

  const handleSuccess = () => {
    setIsLoading(false)
    setContextState(prevState => ({
      ...prevState,
      userPreferences: preferences
    }))
  }

  const handleError = (errorMessage) => {
    setIsLoading(false)
    setError(errorMessage)
  }

  const savePreferences = () => {
    setIsLoading(true)
    preferences.save(handleSuccess, handleError)
  }

  console.log('Rendering UserForm')
  return (
    <div className="settings-container">
      <h3 className="plot-title">Manage User Preferences</h3>
      <div className="form-container">
        <Row>
          <UserMultiPreferences
            preferences={preferences}
            setPreferences={setPreferences}
            type="technologyPreferences"
            title="Edit Technologies to Show"
          />
        </Row>
        <Row>
          <UserSinglePreferences
            preferences={preferences}
            setPreferences={setPreferences}
            type="homePreferences"
            title="Home Page"
          />
          <UserSinglePreferences
            preferences={preferences}
            setPreferences={setPreferences}
            type="dateRangePreferences"
            title="Default Date Range"
          />
          <UserSinglePreferences
            preferences={preferences}
            setPreferences={setPreferences}
            type="showDeletedPreferences"
            title="Show Deleted Archives"
          />
        </Row>
        <Button variant="primary" disabled={!isChanged} onClick={savePreferences}>
          <Text color="white">Save</Text>
        </Button>
        <div className="form-message-text">
          {isLoading && (
            <Text>
              Loading
              {' '}
              <InlineSpinner visible />
            </Text>
          )}
          {error !== '' && (
            <div className="sub-error-text">
              {`Something went wrong: ${error}`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(UserForm)
