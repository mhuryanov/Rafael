import React, { useState, useEffect, Suspense, lazy } from 'react'
import {
  Redirect,
} from 'react-router-dom'
import { SegmentedButton } from '@dx/continuum-segmented-button'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import { FIELDTEST_API } from '../../../../utilities/constants'
import { useFetchRafaelMulti } from '../../../../hooks/fetchData'

const GnssSummary = lazy(() => import('./GnssSummary'))
const TTFFSummary = lazy(() => import('./TTFFSummary'))

const _ = require('underscore')


const GnssCustomSummary = ({ feature, archives, fieldTestIds }) => {
  const [isLoading, fieldTestData] = useFetchRafaelMulti(
    fieldTestIds.map(fieldTestId => ({url: FIELDTEST_API + fieldTestId })), []
  )
  const [allSegments, setAllSegments] = useState([])
  const [selectedSegment, setSelectedSegment] = useState('')
  const { errorMessage } = fieldTestData

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const newAllSegments = new Set()
      fieldTestData.forEach((fieldTest) => {
        const {
          segments = [],
        } = fieldTest
        const newSegments = (
          segments.length > 0
            ? segments.map(segment => segment.name.toUpperCase())
            : []
        )
        newSegments.forEach((segment) => newAllSegments.add(segment))
      })
      setAllSegments(Array.from(newAllSegments))
      setSelectedSegment(Array.from(newAllSegments)[0] || '')
    }
  }, [isLoading, errorMessage, fieldTestData])

  const handleNavClick = (value) => {
    setSelectedSegment(value)
  }
  
  if (errorMessage) {
    return <Redirect to="/error" />
  }

  if (isLoading) {
    return <div className="spinner-gray"><Spinner visible /></div>
  }

  console.log('Rendering GnssCustomSummary')
  return (
    <>
        {allSegments.length > 0 ? (
          <div>
            <div className="tab-header">Segment</div>
            <SegmentedButton 
              segments={allSegments}
              onChange={handleNavClick}
              active={selectedSegment}
            />
          </div>
        ) : (
          <div>No Segments Found. Please Check Dataset.</div>
        )}
        <Suspense fallback={<Spinner visible />}>
          {feature === 'TTFF' ? (
            <TTFFSummary archives={archives} segment={selectedSegment} />
          ) : (
            <GnssSummary
              feature={feature}
              archives={archives}
              segment={selectedSegment}
            />
          )}
        </Suspense>
    </>
  )
}

export default React.memo(GnssCustomSummary)
