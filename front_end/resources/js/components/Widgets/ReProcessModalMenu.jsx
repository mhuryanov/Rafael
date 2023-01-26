import React, { useState } from 'react'
import {
  Modal,
  ModalHeader,
  ModalContent
} from '@dx/continuum-modal'

import ReProcessMenu from './ReProcess'
const ReProcessModalMenu = ({ itemId, itemType, onClose }) => {
  const [showModal, setShowModal] = useState(true)
  const thisOnClose = () => {
    setShowModal(false)
    if (onClose) {
      onClose()
    }
  }
  return (<Modal isOpen={showModal} onClose={onClose}>
    <ModalHeader>{`Re-Process ${itemType} ${itemId}?`}</ModalHeader>
    <ModalContent>
      {showModal &&
        <ReProcessMenu
          itemId={itemId}
          itemType={itemType}
          onClose={thisOnClose}
        />
      }
    </ModalContent>
  </Modal>)
}

export default React.memo(ReProcessModalMenu)