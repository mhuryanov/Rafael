import { USER_API } from './constants'
import { sendToServer, getLocalStorage } from './helpers'

export default class UserPreferences {
  constructor(
    homePreferences = { label: 'Default', value: '/' },
    technologyPreferences = {},
    dateRangePreferences = { label: 'Last 4 Weeks', value: 28 },
    showDeletedPreferences = true,
    favorites = []
  ) {
    this.homePreferences = homePreferences
    this.technologyPreferences = technologyPreferences
    this.dateRangePreferences = dateRangePreferences
    this.showDeletedPreferences = showDeletedPreferences
    this.favorites = favorites
  }

  save(callBack, errorCallBack) {
    const { email: userEmail } = getLocalStorage('LOGIN_AS') ? getLocalStorage('LOGIN_AS') : userInfo
    Object.entries(this).forEach(([pref, value]) => {
      const url = `${USER_API}${userEmail}/${pref}/user_preference`
      const data = value
      sendToServer(url, data, 'PATCH', callBack, errorCallBack)
    })
  }
}

UserPreferences.serialize = user => ({
  homePreferences: user.homePreferences,
  technologyPreferences: user.technologyPreferences,
  dateRangePreferences: user.dateRangePreferences,
  showDeletedPreferences: user.showDeletedPreferences,
  favorites: user.favorites
})

UserPreferences.deserialize = preferences => (
  new UserPreferences(
    preferences.homePreferences,
    preferences.technologyPreferences,
    preferences.dateRangePreferences,
    preferences.showDeletedPreferences,
    preferences.favorites
  )
)

UserPreferences.equals = (userA, userB) => {
  const userJsonA = JSON.stringify(UserPreferences.serialize(userA))
  const userJsonB = JSON.stringify(UserPreferences.serialize(userB))
  return userJsonA === userJsonB
}
