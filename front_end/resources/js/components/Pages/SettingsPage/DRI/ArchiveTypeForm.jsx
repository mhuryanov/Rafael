import React, { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { InlineSpinner } from '@tidbits/react-tidbits/Spinner'
import { Text } from '@tidbits/react-tidbits'
import { Input } from '@dx/continuum-input'
import { Button } from '@dx/continuum-button'
import { Badge } from '@dx/continuum-badge'
import { ARCHIVE_TYPES_API } from '../../../../utilities/constants'
import { sendToServer, capitalizeFirstLetter } from '../../../../utilities/helpers'
const shortid = require('shortid')


const ArchiveTypeForm = () => {
  const [archiveTypes, setArchiveTypes] = useState([])
  const [archiveTypeToAdd, setArchiveTypeToAdd] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    sendToServer(ARCHIVE_TYPES_API, {}, 'GET', setArchiveTypes)
  }, [])

  const handleError = (errorMessage) => {
    setIsLoading(false)
    setError(errorMessage)
  }

  const handleSuccess = () => {
    sendToServer(ARCHIVE_TYPES_API, {}, 'GET', setArchiveTypes)
    setArchiveTypeToAdd('')
    setIsLoading(false)
  }

  const handleAdd = () => {
    const isConfirmed = confirm(`Are you sure you want to add "${archiveTypeToAdd}" ?\nYou will need to set Jobs to proccess this Archive-Type`)
    if (isConfirmed) {
      setIsLoading(true)
      if (archiveTypes.includes(archiveTypeToAdd)) {
        handleError('Please choose a unique Archive name')
      } else {
        sendToServer(ARCHIVE_TYPES_API, {
          "name": archiveTypeToAdd
        }, 'POST', handleSuccess)

      }
    }
  }

  const handleInput = (e) => {
    const newArchiveType = capitalizeFirstLetter(e.target.value)
    const isValidInput = (
      newArchiveType.length <= 1
        ? newArchiveType.match(/^[A-Z]*$/)
        : newArchiveType.match(/^[A-Za-z0-9]+$/)
    )
    if (isValidInput) {
      setArchiveTypeToAdd(newArchiveType)
    }
    setInvalid(!isValidInput)
  }

  console.log('Rendering Archive Type')

  return (
    <Col className="feature-form-container">
      <Row className="feature-form-badge-container">
        {archiveTypes.map(archiveType => (
          <div className="feature-badge" key={shortid.generate()}>
            <Badge variant="primary">{archiveType}</Badge>
          </div>
        ))}
      </Row>
      <Row style={{ marginTop: '15px' }}>
        <Col sm="6" style={{ width: '200px' }}>
          <Input
            autoFocus
            invalid={error !== ''}
            value={archiveTypeToAdd}
            placeholder="Archive Type, Start with Cap"
            onChange={handleInput}
            invalid={invalid}
          />
        </Col>
        <Col>
          <Button
            disabled={!archiveTypeToAdd}
            variant="primary"
            size="small"
            onClick={handleAdd}
          >
            Submit
          </Button>
        </Col>
      </Row>
      <div className="form-message-text">
        {isLoading && <Text>Loading <InlineSpinner visible={true} /></Text>}
        {error !== '' && (
          <div className="sub-error-text">
            {`Something went wrong: ${error}`}
          </div>
        )}
      </div>
    </Col>
  )
}

export default React.memo(ArchiveTypeForm)
