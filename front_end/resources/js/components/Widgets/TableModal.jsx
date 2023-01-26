import React from 'react'
import {
  Modal,
  ModalHeader,
  ModalContent
} from '@dx/continuum-modal'

import ResultsTable from '../Tables/ResultsTable'
import { CTP } from '../../utilities/constants'


const TableModal = ({ isOpen, handleClose, data, errorType = 'FLOOR' }) => {
  let type = ''
  switch (true) {
    case errorType === 'FLOOR' || errorType === 'ADDRESS':
      type = 'ZAXIS'
      break
    case errorType === CTP:
      type = 'CTP_TREND'
      break
    default:
      type = errorType
  }

  return (
    <div className="zaxis-modal">
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalHeader>{type}</ModalHeader>
        <ModalContent>
          {isOpen && <ResultsTable results={data} type={type} />}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default React.memo(TableModal)
