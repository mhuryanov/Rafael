/* eslint-disable camelcase */
import React from 'react'
import { getDeviceIcon } from '../helpers'
import { isUserAdmin } from '../../../../../utilities/helpers'

export const getTitle = (itemType, itemInfo) => {
  switch (itemType) {
    case 'Archive': {
      const { build_train, model_hardware, device_type } = itemInfo
      const ArchiveIcon = getDeviceIcon(device_type)
      return (
        <h2>
          <ArchiveIcon />
          {`(${build_train}) ${model_hardware}`}
        </h2>
      )
    }
    case 'Fieldtest': {
      return <h2>{`[${itemInfo.test_date}]${itemInfo.name}`}</h2>
    }
    default:
      return null
  }
}

const TabOptions = Object.freeze({
  Archive: ['attributes', 'meta', 'history'],
  Fieldtest: ['attributes', 'history', 'meta', 'segments']
})

export const getPopUpTabs = (itemtype) => {
  if (!itemtype || !TabOptions[itemtype]) {
    return []
  }
  return (isUserAdmin) ? TabOptions[itemtype].concat(['admin_meta']) : TabOptions[itemtype]
}
