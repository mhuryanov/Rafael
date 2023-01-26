import React, { useContext } from 'react'
import { Suspense, lazy } from 'react'
import { Col } from 'react-bootstrap'
import { Text } from '@tidbits/react-tidbits'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import UserPreferences from '../../../../utilities/UserPreferences'
import { DEFAULT_DATE_RANGE_OPTIONS, DEFAULT_YES_NO } from '../../../Widgets/DateRange'
import { StateContext } from '../../../StateContext'
import { getTechnologiesToShow } from '../../../../utilities/helpers'

const Select = lazy(() => import('react-select'))

const getHomePreferences = (technologies) => {
  const homePreferences = [
    { label: 'Default', value: '/' },
    { label: 'Advanced Search', value: '/search' },
    { label: 'Pipeline Status', value: '/status' }
  ]
  technologies.forEach((technology) => {
    homePreferences.push({
      label: technology,
      value: `/technology/${technology}`
    })
  })
  return homePreferences
}


const UserSinglePreferences = ({ preferences, setPreferences, type, title }) => {
  const { userPreferences } = useContext(StateContext)
  const { technologyPreferences } = userPreferences
  const targetPref = preferences[type]
  const allPrefOptions = {
    homePreferences: getHomePreferences(getTechnologiesToShow(technologyPreferences)),
    showDeletedPreferences: DEFAULT_YES_NO,
    dateRangePreferences: DEFAULT_DATE_RANGE_OPTIONS
      .filter(option => option.value !== 'custom')

  }

  const handlePrefSelect = (option) => {
    setPreferences(prevPrefs => {
      const newPrefs = UserPreferences.deserialize(UserPreferences.serialize(prevPrefs))
      const newTargetPref = option
      newPrefs[type] = newTargetPref
      return newPrefs
    })
  }

  console.log('Rendering UserSinglePreferences')
  return (
    <Col className="form-element" xs="2" lg="2" md="2" sm="2" xl="2">
      <Text textStyle="h5Regular">{title}</Text>
      <div className="single-select-body">
        <Suspense fallback={<Spinner visible />}>
          <Select
            value={targetPref}
            onChange={handlePrefSelect}
            options={allPrefOptions[type]}
          />
        </Suspense>
      </div>
    </Col>
  )
}

export default React.memo(UserSinglePreferences)
