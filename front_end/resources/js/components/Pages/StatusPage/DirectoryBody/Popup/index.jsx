/* eslint-disable no-console */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { useState, useEffect, useContext, Suspense, lazy } from 'react'
import PropType from 'prop-types'
import { Nav, Spinner, Button, Modal, Alert } from 'react-bootstrap'
import Constants from '../../../../../utilities/constants'
import { IoIosRefresh } from 'react-icons/io/index'
import useDeepCompareEffect from 'use-deep-compare-effect'
import { labelCase, sendToServer, canUserEdit } from '../../../../../utilities/helpers'
const ItemAttributes = lazy(() => import('./ItemAttributes'))
const PipelineHistory = lazy(() => import('./PipelineHistory'))
const ItemMeta = lazy(() => import('./ItemMeta'))
const FieldTestSegments = lazy(() => import('./FieldTestSegments'))
const _ = require('underscore')
const shortid = require('shortid');
import produce from 'immer'
import { getTitle, getPopUpTabs } from './helper'
import { StateContext } from '../../../../StateContext'
import { showMenu } from 'react-contextmenu/modules/actions'
const ReProcessModalMenu = lazy(() => import('../../../../Widgets/ReProcessModalMenu'))
const ItemPopup = ({
  itemType, itemId, show, onClose
}) => {
  const { userPermissions } = useContext(StateContext)
  const [itemInfo, setItemInfo] = useState(null)
  const [technology, setTechnology] = useState(null)
  const [allMetaDistinct, setAllMetaDistinct] = useState(null)
  const [itemMeta, setItemMeta] = useState([])
  const [adminItemMeta, setAdminItemMeta] = useState([])
  const [tabName, setTabName] = useState('attributes')
  const [changed, setChanged] = useState({ attributes: false, meta: false, admin_meta: false, segments: false })
  const [error, setError] = useState(null)
  const url = (itemType === 'Archive') ? Constants.ARCHIVE_API : Constants.FIELDTEST_API
  const metaUrl = (itemType === 'Archive') ? Constants.ARCHIVE_META_API : Constants.FIELDTEST_META_API

  const checkKeys = (meta) => {
    const allKeys = meta.reduce((accumulator, currentValue) => accumulator.concat(currentValue.key), [])
    if (_.uniq(allKeys, JSON.stringify).length !== allKeys.length) {
      setError("All Keys need to be unique")
      return false
    } else if (undefined !== allKeys.find(m => m == '')) {
      setError("Key cant be empty")
      return false
    } else {
      setError(null)
      return true
    }
  }
  useDeepCompareEffect(() => {
    checkKeys(itemMeta) && checkKeys(adminItemMeta)
  }, [itemMeta, adminItemMeta]);

  const updateChanged = (key) => {
    setChanged(produce(changed, draft => {
      draft[key] = true
    }))
  }

  const onMetaRemove = (id) => {
    updateChanged('meta')
    setItemMeta(_.filter(itemMeta, (m) => { return m.id !== id }))
  }
  const onAdminMetaRemove = (id) => {
    updateChanged('admin_meta')
    setAdminItemMeta(_.filter(adminItemMeta, (m) => { return m.id !== id }))
  }

  const onMetaAdd = () => {
    if (_.filter(itemMeta, (m) => { return m.key === '' }).length === 0) {
      setItemMeta(itemMeta.concat([{ key: '', value: '', id: shortid.generate() }]))
      updateChanged('meta')
    }
  }
  const onAdminMetaAdd = () => {
    if (_.filter(adminItemMeta, (m) => { return m.key === '' }).length === 0) {
      setAdminItemMeta(adminItemMeta.concat([{ key: '', value: '', id: shortid.generate() }]))
      updateChanged('admin_meta')
    }
  }
  const onKeyChange = ({ value }, id) => {
    setItemMeta(produce(itemMeta, draft => {
      draft[draft.findIndex(m => m.id === id)].key = value
    }))
    updateChanged('meta')
  }

  const onAdminKeyChange = ({ value }, id) => {
    setAdminItemMeta(produce(adminItemMeta, draft => {
      draft[draft.findIndex(m => m.id === id)].key = value
    }))
    updateChanged('admin_meta')
  }

  const onValueChange = ({ value }, id) => {
    setItemMeta(produce(itemMeta, draft => {
      draft[draft.findIndex(m => m.id === id)].value = value
    }))
    updateChanged('meta')
  }
  const onAdminValueChange = ({ value }, id) => {
    setAdminItemMeta(produce(adminItemMeta, draft => {
      draft[draft.findIndex(m => m.id === id)].value = value
    }))
    updateChanged('admin_meta')
  }
  const onSave = () => {
    if (canUserEdit(userPermissions, technology)) {
      if (changed.meta) {
        const allKeys = itemMeta.reduce((accumulator, currentValue) => accumulator.concat(currentValue.key), [])
        const allValues = itemMeta.reduce((accumulator, currentValue) => accumulator.concat(currentValue.value), [])
        const meta = _.object(allKeys, allValues)
        sendToServer(metaUrl + itemId, { meta, meta_type: 'user' }, 'PATCH', fetchItem, setError)
      }
      if (changed.admin_meta) {
        const allKeys = adminItemMeta.reduce((accumulator, currentValue) => accumulator.concat(currentValue.key), [])
        const allValues = adminItemMeta.reduce((accumulator, currentValue) => accumulator.concat(currentValue.value), [])
        const meta = _.object(allKeys, allValues)
        sendToServer(metaUrl + itemId, { meta, meta_type: 'admin' }, 'PATCH', fetchItem, setError)
      }
      if (changed.segments) {
        const { segments } = itemInfo
        sendToServer(url + itemId, { segments }, 'PATCH', fetchItem, setError)
      }
    }
  }


  const getBody = () => {
    switch (tabName) {
      case 'attributes':
        return <ItemAttributes info={itemInfo} />
      case 'history':
        return <PipelineHistory info={itemInfo} itemType={itemType} />
      case 'meta':
        return <ItemMeta
          allMetaDistinct={allMetaDistinct && { key: allMetaDistinct.user_key, value: allMetaDistinct.user_value }}
          itemMeta={itemMeta}
          onMetaRemove={onMetaRemove}
          onMetaAdd={onMetaAdd}
          onValueChange={onValueChange}
          onKeyChange={onKeyChange}
        />
      case 'admin_meta':
        return <ItemMeta
          allMetaDistinct={allMetaDistinct && { key: allMetaDistinct.admin_key, value: allMetaDistinct.admin_value }}
          itemMeta={adminItemMeta}
          onMetaRemove={onAdminMetaRemove}
          onMetaAdd={onAdminMetaAdd}
          onValueChange={onAdminValueChange}
          onKeyChange={onAdminKeyChange}
        />
      case 'segments':
        return <FieldTestSegments
          info={itemInfo}
        />
    }
  }


  const fetchItem = () => {
    sendToServer(url + itemId, {}, 'GET', (payload) => {
      setItemInfo(payload)
      setTechnology(payload.technology)
    })
    sendToServer(metaUrl + 'distinct/', {}, 'GET', setAllMetaDistinct)
    sendToServer(metaUrl + itemId, {}, 'GET', (itemMeta) => {
      const meta = _.map(itemMeta.user, (value, key) => { return { key, value, id: shortid.generate() } })
      const admin_meta = _.map(itemMeta.admin, (value, key) => { return { key, value, id: shortid.generate() } })
      setItemMeta(meta)
      setAdminItemMeta(admin_meta)
    })
    setChanged({ attributes: false, meta: false, admin_meta: false })
  }
  const [showReProccess, setShowReProccess] = useState(false)
  const onProccessedItemClick = (eventKey) => {
    if (!showReProccess) {
      showMenu({
        position: {
          x: eventKey.pageX,
          y: eventKey.pageY - document.documentElement.scrollTop
        },
        target: {},
        id: shortid.generate()
      });
    }
    setShowReProccess(!showReProccess)

  }
  useEffect(() => {
    fetchItem()
  }, [itemType, itemId])


  return (itemInfo
    && (
      <Modal
        show={show}
        onHide={onClose}
        dialogClassName="modal-200w"
        aria-labelledby="example-custom-modal-styling-title"
        centered
        animation
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            {getTitle(itemType, itemInfo)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Nav variant="tabs" defaultActiveKey={tabName} onSelect={setTabName}>
            {_.map(getPopUpTabs(itemType), (tab) => <Nav.Item key={shortid.generate()}>
              <Nav.Link eventKey={tab}>{labelCase(tab)}</Nav.Link>
            </Nav.Item>
            )}
          </Nav>
          <div style={{ paddingTop: '15px', paddingBottom: '15px' }}>
            <Suspense fallback={<Spinner animation="grow" variant="info" />}>
              {getBody()}
            </Suspense>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {error ? <Alert variant="danger">
            {error}
          </Alert> : <Button variant="success" disabled={!canUserEdit(userPermissions, technology) || !_.contains(Object.values(changed), true)} onClick={onSave}>Save</Button>}
          <Button variant="info" onClick={fetchItem}>Reset</Button>
          <Button variant="warning" onClick={onProccessedItemClick}><IoIosRefresh /></Button>
        </Modal.Footer>
        <Suspense fallback={<Spinner animation="grow" variant="info" />}>
          {showReProccess && <ReProcessModalMenu
            itemId={itemId}
            itemType={itemType}
            onClose={() => { setShowReProccess(false); fetchItem(); }}

          />}
        </Suspense>
      </Modal>
    )
  )
}

ItemPopup.propTypes = {
  show: PropType.bool.isRequired,
  itemType: PropType.string.isRequired,
  itemId: PropType.string.isRequired,
  onClose: PropType.func.isRequired,


}

export default React.memo(ItemPopup)
