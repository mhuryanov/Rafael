import React, { useEffect, useState } from 'react'
import { Spinner } from '@tidbits/react-tidbits/Spinner/Spinner'
import { useFetchRafael, useFetchRafaelMulti } from '../hooks/fetchData'
import { TECHNOLOGY_INFO_API, USER_API, EXCLUDE_TECHNOLOGIES } from '../utilities/constants'
import UserPreferences from '../utilities/UserPreferences'
import { sortedByKey, isEmpty, getUserInfo } from '../utilities/helpers'

const _ = require('underscore')

const SESSION_RESET_TIME = 30 * 60

export const TimeContext = React.createContext()
export const StateContext = React.createContext()
export const SetStateContext = React.createContext()

const DEFAULT_PREFERENCES = [
  'homePreferences',
  'technologyPreferences',
  'dateRangePreferences',
  'showDeletedPreferences',
  'favorites'
]


export const StateProvider = ({ children }) => {
  const [state, setState] = useState({})
  const [isLoadingState, setIsLoadingState] = useState(true)
  const [isLoadingTechnology, technologyInfo] = useFetchRafael({ url: TECHNOLOGY_INFO_API }, [])
  const { email: user_email } = getUserInfo()
  const [isLoadingUserPermissions, userPermissions] = useFetchRafael({ url: `${USER_API}${user_email}/user_info/` }, [])
  const [isLoadingUserPreferences, userPreferencesList] = useFetchRafaelMulti(DEFAULT_PREFERENCES.map(pref => ({ url: `${USER_API}${user_email}/${pref}/user_preference` })), [])
  const [time, setTime] = useState(0)
  const isLoading = isLoadingTechnology || isLoadingUserPreferences || isLoadingUserPermissions
  const isError = technologyInfo.errorMessage || userPreferencesList.errorMessage || userPermissions.errorMessage

  const setSessionTime = () => {
    const sessionTime = sessionStorage.getItem('timeInSeconds')
    let newSessionTime = sessionTime ? Number(sessionTime) + 1 : 1
    if (newSessionTime > SESSION_RESET_TIME) {
      sessionStorage.clear()
      newSessionTime = 1
    }
    sessionStorage.setItem('timeInSeconds', newSessionTime)
    setTime(newSessionTime)
  }

  useEffect(() => {
    if (!isLoading && !isError) {
      const newTechnologyIsPublic = {}
      technologyInfo
        .filter(technology => !EXCLUDE_TECHNOLOGIES.includes(technology.name))
        .forEach((technology) => {
          const { name, is_public } = technology
          newTechnologyIsPublic[name] = is_public
        })
      const newTechnologyFeatures = {}
      technologyInfo
        .filter(technology => !EXCLUDE_TECHNOLOGIES.includes(technology.name))
        .forEach((technology) => {
          const { name, features } = technology
          let newFeatures = [...features].sort()
          if (name === 'CLX') newFeatures = _.without(newFeatures, 'TEST')
          newTechnologyFeatures[name] = newFeatures
        })
      const userPreferences = {}
      DEFAULT_PREFERENCES.forEach((pref, i) => {
        userPreferences[pref] = isEmpty(userPreferencesList[i]) ? undefined : userPreferencesList[i]
      })
      const { technologyPreferences } = userPreferences
      const newTechnologyPreferences = (
        technologyPreferences && !Array.isArray(technologyPreferences)
          ? JSON.parse(JSON.stringify(technologyPreferences))
          : {}
      )
      Object.keys(newTechnologyFeatures).forEach((technology) => {
        if (!(technology in newTechnologyPreferences)) {
          newTechnologyPreferences[technology] = true
        }
      })
      userPreferences.technologyPreferences = sortedByKey(newTechnologyPreferences)
      const newUserPreferences = UserPreferences.deserialize(userPreferences)
      setState({
        technologyFeatures: newTechnologyFeatures,
        userPreferences: newUserPreferences,
        technologyIsPublic: newTechnologyIsPublic,
        userPermissions
      })
      setIsLoadingState(false)
    }
  }, [isLoading, isError, technologyInfo, userPermissions, userPreferencesList])


  useEffect(() => {
    const interval = setInterval(async () => setSessionTime(), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <TimeContext.Provider value={time}>
      <StateContext.Provider value={state}>
        <SetStateContext.Provider value={setState}>
          {!isLoadingState && children}
          <Spinner visible={isLoadingState} />
        </SetStateContext.Provider>
      </StateContext.Provider>
    </TimeContext.Provider>
  )
}
