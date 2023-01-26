/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React from 'react'
import { NavMenu, Icons } from '@tidbits/react-tidbits'
import {
  useParams,
  useHistory
} from 'react-router-dom'
import { isUserAdmin, getUserInfo } from '../../../utilities/helpers'
const _ = require('underscore')

const SETTINGS_MAPPING = {
  user: <><Icons.PersonIcon width="20px" height="20px" mt="-2px" mr="5px" />User Preferences</>,
  dri: <><Icons.ProfileIcon width="20px" height="20px" mt="-2px" mr="5px" />DRI Settings</>,
  admin: <><Icons.FanFilledIcon width="20px" height="20px" mt="-2px" mr="5px" />Admin Settings</>
}

const SettingsList = () => {
  const { setting: currentSetting } = useParams()
  const history = useHistory()

  const handleSettingsClick = (setting) => {
    history.push(`/settings/${setting}`)
  }

  console.log('Rendering SettingsList')
  const settings = SETTINGS_MAPPING
  const userInfo = getUserInfo()
  if (!isUserAdmin()) {
    delete settings.admin
    if (userInfo.admins_of.length + userInfo.maintainers_of.length === 0) {
      delete settings.dri
    }
  }
  return (
    <NavMenu variant="side" width="220px">
      <NavMenu.Links>
        {_.map(settings, (label, setting) => (
          <NavMenu.Link
            key={setting}
            active={setting === currentSetting}
            onClick={() => handleSettingsClick(setting)}
          >
            {label}
          </NavMenu.Link>
        ))}
      </NavMenu.Links>
    </NavMenu>
  )
}

export default React.memo(SettingsList)
