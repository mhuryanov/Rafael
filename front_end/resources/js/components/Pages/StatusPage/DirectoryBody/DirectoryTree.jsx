/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { Suspense, lazy, useReducer, useEffect, useState, useContext } from 'react'
import {
  Container, Spinner
} from 'react-bootstrap'
import { ContextMenu, MenuItem } from 'react-contextmenu'
import { showMenu } from 'react-contextmenu/modules/actions'
import { downloadArchive, canUserEdit, sendToServer, removeTags } from '../../../../utilities/helpers'
import {
  treeNodeTechnologyGenerator,
  getMenuItems,
  getMenuItemStyle,
  getMenuIcon,
  reName,
  moveArchive,
  deleteRestoreItem,
  getKeysFromArchive,
  getKeysFromFieldTest
} from './helpers'
import { DirectoryReducer, initialDirectoryState, getDirectoryData, TECHNOLOGIES, TEST_DATES, FIELDTESTS } from './DirectoryReducer'
import PropType from 'prop-types'
import {
  Modal,
  ModalHeader,
  ModalContent
} from '@dx/continuum-modal'

import { Row, Col } from 'react-bootstrap'
import { SearchInput } from '@dx/continuum-search-input'
import { InlineSpinner } from '@tidbits/react-tidbits/Spinner'
import { useHistory } from 'react-router-dom'

import { StateContext } from '../../../StateContext'
import { ARCHIVE_API, FIELDTEST_API, TAGS_DEEPEXCLUDED } from '../../../../utilities/constants'
import { isValidUUID } from '../../../../utilities/helpers'

const ReProcessMenu = lazy(() => import('../../../Widgets/ReProcess'))
const shortid = require('shortid')

const ItemPopup = lazy(() => import('./Popup'));
const Tree = lazy(() => import('rc-tree'));

const _ = require('underscore')

const DirectoryTree = ({ includeDeleted }) => {
  const history = useHistory()
  const { userPreferences, userPermissions } = useContext(StateContext)
  const { technologyPreferences } = userPreferences
  const [directoryState, directoryStatedispatch] = useReducer(DirectoryReducer, initialDirectoryState)
  const [expandedKeys, setExpandedKeys] = useState([])
  const [selectedKeys, setSelectedKeys] = useState([])
  const [popUp, setPopUp] = useState({ show: false })
  const [rightClickItem, setRightClickItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const onPopUpClose = () => setPopUp({ show: false })
  useEffect(() => {
    getDirectoryData(TECHNOLOGIES, {}, directoryState, directoryStatedispatch)
  }, [])
  const [error, setError] = useState('')

  const onRightClick = (selected) => {
    const clickedItem = JSON.parse(selected.node.props.eventKey)
    if (getMenuItems(clickedItem).length !== 0) {
      showMenu({
        position: {
          x: selected.event.pageX,
          y: selected.event.pageY - document.documentElement.scrollTop
        },
        target: {},
        id: 'DirectoryRightClick'
      });
      setRightClickItem(clickedItem)
    }
  }
  const handleRightClick = (e, { menuItem }) => {
    switch (menuItem) {
      case 'Details': {
        setPopUp({ show: true, itemType: rightClickItem.type, itemId: rightClickItem.id })
        break;
      }
      case 'Rename': {
        const newName = prompt('Please enter a New Name for ' + rightClickItem.type)
        const callBack = () => getDirectoryData(FIELDTESTS, { technology: rightClickItem.parents[0], feature: rightClickItem.parents[1], testDate: rightClickItem.parents[2] }, directoryState, directoryStatedispatch)
        newName && reName(rightClickItem, newName, callBack)
        break;
      }
      case 'Move': {
        const newFieldtestId = prompt('Please enter valid Fieldtest ID ')
        const callBack = () => getDirectoryData(FIELDTESTS, { technology: rightClickItem.parents[0], feature: rightClickItem.parents[1], testDate: rightClickItem.parents[2] }, directoryState, directoryStatedispatch)
        newFieldtestId && moveArchive(rightClickItem, newFieldtestId, callBack)
        break;
      }
      case 'Delete':
      case 'Restore': {
        const callBack = () => getDirectoryData(FIELDTESTS, { technology: rightClickItem.parents[0], feature: rightClickItem.parents[1], testDate: rightClickItem.parents[2] }, directoryState, directoryStatedispatch)
        deleteRestoreItem(rightClickItem, menuItem.toLowerCase(), callBack)
      }
        break
      case 'Include': {
        removeTags(rightClickItem.id, [TAGS_DEEPEXCLUDED])
      }
        break
      case 'Download':
        downloadArchive(rightClickItem.id)
        break;
      case 'ReProcess':
        setShowModal(true)
        break
      case 'View Tables':
        history.push(`technology/${rightClickItem.parents[0]}/${rightClickItem.parents[1]}/device/${rightClickItem.id}`)
        break
      default:
        break

    }
  }

  const onSelect = (selecteds) => {
    if (selecteds.length !== 1) {
      return
    }
    if (expandedKeys.includes(selecteds[0])) {
      setExpandedKeys(_.without(expandedKeys, selecteds[0]))
      return
    }
    const selected = JSON.parse(selecteds[0])
    switch (selected.type) {
      case 'Feature':
        getDirectoryData(TEST_DATES, { technology: selected.parents[0], feature: selected.id }, directoryState, directoryStatedispatch)
        break
      case 'TestDate':
        getDirectoryData(FIELDTESTS, { technology: selected.parents[0], feature: selected.parents[1], testDate: selected.id }, directoryState, directoryStatedispatch)
        break
      case 'Archive':
        setPopUp({ show: true, itemType: 'Archive', itemId: selected.id })
      default:
    }
    setExpandedKeys(expandedKeys.concat([selecteds[0]]))
    setSelectedKeys(selecteds)
  }



  const handleClose = () => {
    setShowModal(false)
  }

  const handleSearchError = (errorMessage) => {
    setError(errorMessage)
    setIsLoadingSearch(false)
  }

  const addExpandedKey = (key) => {
    setExpandedKeys(prevKeys => {
      if (!prevKeys.includes(key)) return prevKeys.concat([key])
      return prevKeys
    })
  }

  const fieldTestCallback = (fieldTestPayload) => {
    const { technology, feature, test_date } = fieldTestPayload
    const keys = getKeysFromFieldTest(fieldTestPayload)
    getDirectoryData(TEST_DATES, { technology, feature }, directoryState, directoryStatedispatch, () => {
      getDirectoryData(FIELDTESTS, { technology, feature, testDate: test_date }, directoryState, directoryStatedispatch)
      setIsLoadingSearch(false)
    })
    keys.forEach(key => addExpandedKey(key))
    if (keys.length > 0) setSelectedKeys([keys[keys.length - 1]])
  }

  const archiveCallback = (archivePayload) => {
    const { fieldtest_id } = archivePayload
    sendToServer(FIELDTEST_API + fieldtest_id, {}, 'GET', (fieldTestPayload) => {
      fieldTestCallback(fieldTestPayload)
      const { test_date } = fieldTestPayload
      const keys = getKeysFromArchive(archivePayload, test_date)
      keys.forEach(key => addExpandedKey(key))
      if (keys.length > 0) setSelectedKeys([keys[keys.length - 1]])
    }, handleSearchError)
  }

  const handleSearch = (e) => {
    const { value: itemId } = e.target
    if (!isValidUUID(itemId)) {
      setError('Invalid UUID')
      return
    }
    if (!isLoadingSearch) {
      setIsLoadingSearch(true)
      sendToServer(ARCHIVE_API + itemId, {}, 'GET', archiveCallback, () => {
        sendToServer(FIELDTEST_API + itemId, {}, 'GET', fieldTestCallback, handleSearchError)
      })
    }
  }

  const treeData = treeNodeTechnologyGenerator(directoryState.allTechnologies)
    .filter(entry => technologyPreferences[entry.title])
    .filter(entry => canUserEdit(userPermissions, entry.title))
  return (treeData !== [] &&
    <Container fluid>
      <Suspense fallback={<Spinner animation="grow" variant="info" />}>
        <Row>
          <SearchInput placeholder="Search by UUID" onEnter={handleSearch} invalid={error} onChange={() => error && setError('')} />
          <InlineSpinner visible={isLoadingSearch} ml="7px" />
        </Row>
        <Tree
          showLine
          defaultExpandAll
          treeData={treeData}
          onSelect={onSelect}
          onClick={onSelect}
          onDoubleClick={onSelect}
          onRightClick={onRightClick}
          expandedKeys={expandedKeys}
          selectedKeys={selectedKeys}
        />
        <ContextMenu id="DirectoryRightClick">
          {getMenuItems(rightClickItem).map(menuItem => (
            <MenuItem data={{ menuItem }} onClick={handleRightClick} key={shortid.generate()}>
              <Row key={shortid.generate()}>
                <Col style={getMenuItemStyle(menuItem)}>{getMenuIcon(menuItem)}</Col>
                <Col>{menuItem}</Col>
              </Row>
            </MenuItem>
          ))}
        </ContextMenu>
        {popUp.show && <ItemPopup {...popUp} onClose={onPopUpClose} />}
        {rightClickItem && ['Archive', 'Fieldtest'].includes(rightClickItem.type) && (
          <Modal isOpen={showModal} onClose={handleClose}>
            <ModalHeader>{`Re-Process ${rightClickItem.type} ${rightClickItem.label}?`}</ModalHeader>
            <ModalContent>
              {showModal && (
                <>
                  <ReProcessMenu
                    itemId={rightClickItem.id}
                    itemType={rightClickItem.type}
                    onClose={handleClose}
                  />
                </>
              )}
            </ModalContent>
          </Modal>
        )}
      </Suspense>
    </Container >)

}

DirectoryTree.propTypes = {
  includeDeleted: PropType.bool.isRequired
}
export default React.memo(DirectoryTree)