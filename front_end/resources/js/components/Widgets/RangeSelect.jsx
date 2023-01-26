import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Input, Text } from '@tidbits/react-tidbits'
import { Button } from '@dx/continuum-button'


const RangeSelect = ({ range, setRange, callBack, step = 1 }) => {
  const [lower, setLower] = useState(range.lower)
  const [upper, setUpper] = useState(range.upper)
  const [error, setError] = useState('')

  useEffect(() => {
    setLower(range.lower !== undefined ? range.lower : '')
    setUpper(range.upper !== undefined ? range.upper : '')
    if (error) setError('')
  }, [range])

  const handleSave = () => {
    const newLower = Number(lower)
    const newUpper = Number(upper)
    if (newLower === range.lower && newUpper === range.upper) return
    if (lower === '' || upper === '' || newLower > newUpper) {
      setError('Please choose valid range')
    } else {
      setRange(prevState => ({
        ...prevState,
        lower: newLower,
        upper: newUpper
      }))
      if (callBack) callBack(newLower, newUpper)
      if (error) setError('')
    }
  }

  return (
    <div>
      <Row className="justify-content-center">
        <Col style={{ minWidth: '180px', maxWidth: '200px' }}>
          <Input.Text
            type="number"
            step={step}
            variant={error && 'error'}
            value={lower}
            placeholder="Set lower bound..."
            onChange={(e) => {
              const newValue = e.target.value
              setLower(newValue)
              if (error) setError('')
            }}
          />
        </Col>
        <Col style={{ minWidth: '180px', maxWidth: '200px' }}>
          <Input.Text
            type="number"
            step={step}
            variant={error && 'error'}
            value={upper}
            placeholder="Set upper bound..."
            onChange={(e) => {
              const newValue = e.target.value
              setUpper(newValue)
              if (error) setError('')
            }}
          />
        </Col>
        <Button variant="confirm" onClick={handleSave}>Save</Button>
      </Row>
      {error && (
        <div className="sub-error-text" style={{ textAlign: 'center' }}>
          {`${error}`}
        </div>
      )}
    </div>
  )
}

export default React.memo(RangeSelect)
