/* eslint-disable no-console */
/* eslint-disable import/no-duplicates */
import React from 'react'
import { FiCompass } from 'react-icons/fi/index'
import { FaSitemap } from 'react-icons/fa/index'
import { FaRegCalendarCheck } from 'react-icons/fa/index'
import { IoMdTrain } from 'react-icons/io/index'
import { IoIosRefresh } from 'react-icons/io/index'
import { IoIosPhonePortrait } from 'react-icons/io/index'
import { AiOutlineQuestionCircle } from 'react-icons/ai/index'
import { AiTwotoneExperiment } from 'react-icons/ai/index'
import { MdWatch } from 'react-icons/md/index'
import { IoIosCloudDownload } from 'react-icons/io/index'
import { MdDeleteSweep } from 'react-icons/md/index'

import { IoIosMore } from 'react-icons/io/index'
import { FaTrash } from 'react-icons/fa/index'
import { FaRev } from 'react-icons/fa/index'
import { FaEdit } from 'react-icons/fa/index'
import { ImBoxRemove } from 'react-icons/im/index'
import { FaTrashRestore } from 'react-icons/fa/index'
import Constants from '../../../../utilities/constants'
import { sendToServer } from '../../../../utilities/helpers'


export const getDeviceIcon = (modelHardware) => {
  switch (modelHardware) {
    case 'iPhone':
      return IoIosPhonePortrait
    case 'Watch':
      return MdWatch
    case 'PENDING':
      return IoIosRefresh
    default:
      return AiOutlineQuestionCircle
  }
}

const RightClickOptions = Object.freeze({
  Archive: ['Details', 'ReProcess', 'Rename', 'View Tables', 'Download', 'Move', 'Include'],
  Fieldtest: ['Details', 'Rename', 'ReProcess']
})

export const getMenuItems = (rightClickItem) => {
  if (!rightClickItem || !RightClickOptions[rightClickItem.type]) {
    return []
  }
  return RightClickOptions[rightClickItem.type].concat((rightClickItem.is_deleted) ? ['Restore'] : ['Delete'])
}

export const getTreeIcon = (item) => {
  if (item.is_deleted) {
    return <MdDeleteSweep color="red" />
  }
  switch (item.type) {
    case 'Technology':
      return <FaSitemap />
    case 'Feature':
      return <FiCompass />
    case 'DateTime':
      return <FaRegCalendarCheck />
    case 'Train':
      return <IoMdTrain />
    case 'Fieldtest':
      return <AiTwotoneExperiment />
    case 'Archive':
      return getDeviceIcon(item.device_type)
    default:
      return <FaSitemap />
  }
}

export const getMenuIcon = (menuItem) => {
  switch (menuItem) {
    case 'Download':
      return <IoIosCloudDownload />
    case 'Details':
      return <IoIosMore />
    case 'Restore':
      return <FaTrashRestore />
    case 'ReProcess':
      return <FaRev />
    case 'Delete':
      return <FaTrash />
    case 'Rename':
      return <FaEdit />
    case 'Move':
      return <ImBoxRemove />
    default:
      return <IoIosMore />
  }
}
export const getMenuItemStyle = (menuItem) => {
  const getMenuItemColor = () => {
    switch (menuItem) {
      case 'Download':
        return 'CadetBlue'
      case 'Details':
        return 'green'
      case 'Restore':
        return 'black'
      case 'ReProcess':
        return 'blue'
      case 'Delete':
        return 'red'
      case 'Rename':
        return 'brown'
      case 'Move':
        return 'pink'
      default:
        return 'grey'
    }
  }
  return { color: getMenuItemColor() }
}


export function treeNodeTechnologyGenerator(head, parents = []) {
  const node = []

  for (let i = 0; head && i < head.length; i += 1) {
    const item = head[i]
    const copyItem = { ...item, parents }
    delete copyItem.children
    const children = item.children !== undefined
      ? treeNodeTechnologyGenerator(item.children, parents.concat([item.id]))
      : null
    node.push({
      title: item.label,
      key: JSON.stringify(copyItem),
      children,
      icon: getTreeIcon(item),
      isLeaf: item.type === 'Archive'
    })
  }
  return node
}


export const reName = (item, newName, callBack = null, errorCallBack = null) => {

  sendToServer(`${Constants.FIELDTEST_ARCHIVE_SHARED_API + item.id}/rename`, { new_name: newName }, 'POST', callBack, errorCallBack)
}

export const moveArchive = (item, fieldtest_id, callBack = null, errorCallBack = null) => {
  sendToServer(`${Constants.ARCHIVE_API + item.id}/move`, { fieldtest_id }, 'POST', callBack, errorCallBack)
}


export const deleteRestoreItem = (item, action, callBack) => {
  sendToServer(`${Constants.FIELDTEST_ARCHIVE_SHARED_API + item.id}/delete_restore`, {}, 'GET', callBack, () => { console.log('deleteRestoreItem Failed') })
}

export const getKeysFromFieldTest = (payload) => {
  const {
    technology, feature, test_date, id, name, is_deleted
  } = payload
  const technologyKey = JSON.stringify({
    id: technology,
    type: 'Technology',
    label: technology,
    parents: []
  })
  const featureKey = JSON.stringify({
    id: feature,
    type: 'Feature',
    label: feature,
    parents: [technology]
  })
  const testDateKey = JSON.stringify({
    id: test_date,
    label: test_date,
    type: 'TestDate',
    parents: [technology, feature]
  })
  const fieldTestIdKey = JSON.stringify({
    id,
    label: name,
    type: 'Fieldtest',
    is_deleted,
    parents: [technology, feature, test_date]
  })
  return [technologyKey, featureKey, testDateKey, fieldTestIdKey]
}

export const getKeysFromArchive = (payload, testDate) => {
  const {
    archivetype,
    technology,
    feature,
    build_train,
    model_hardware,
    fieldtest_id,
    id,
    is_deleted,
    device_type,
    pipelinestate
  } = payload
  const buildTrainKey = JSON.stringify({
    id: build_train,
    label: build_train,
    type: 'Train',
    parents: [technology, feature, testDate, fieldtest_id]
  })
  const archiveIdKey = JSON.stringify({
    id,
    type: 'Archive',
    label: model_hardware,
    is_deleted,
    device_type,
    pipelinestate,
    archive_type: archivetype,
    parents: [technology, feature, testDate, fieldtest_id, build_train]
  })
  return [buildTrainKey, archiveIdKey]
}

