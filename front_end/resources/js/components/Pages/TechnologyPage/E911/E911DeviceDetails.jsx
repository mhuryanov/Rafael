/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Text, Icons } from '@tidbits/react-tidbits'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import {
  Modal,
  ModalHeader,
  ModalContent
} from '@dx/continuum-modal'

import HelpTooltip from '../../../Widgets/HelpTooltip'
import Box from '../../../Box'
import HiddenBox from '../../../HiddenBox'

const ScannerTable = lazy(() => import('../../../Tables/ScannerTable'))
const SummaryTable = lazy(() => import('../../../Tables/SummaryTable'))
const CdfPlot = lazy(() => import('../../../Plots/Cdf'))
const MultiTimeSeriesKPIColumn = lazy(() => import('../../../Plots/MultiTimeSeriesKPIColumn'))

const technology = "E911"

export const BLOCKED = 0
export const UNKNOWN = 1
export const FAIL = 2
export const PASS_WITH_ISSUES = 3
export const PASS = 4
export const OBSERVATION = 5
export const NOLOG = 6

export const E911VerdictMapping = {
  [BLOCKED]: 'Blocked',
  [UNKNOWN]: 'Unknown',
  [FAIL]: 'Fail',
  [PASS_WITH_ISSUES]: 'Pass w/ Issues',
  [PASS]: 'Pass',
  [OBSERVATION]: 'Observation',
  [NOLOG]: 'No Log'
}

export const E911VerdictIcons = {
  [BLOCKED]: <Icons.PauseFilledIcon height="16px" width="16px" color="navLabelDisabled" />,
  [UNKNOWN]: <Icons.HelpIcon height="16px" width="16px" />,
  [FAIL]: <Icons.CloseFilledIcon height="16px" width="16px" color="error" />,
  [PASS_WITH_ISSUES]: <Icons.WarningFilledIcon height="16px" width="16px" color="warning" />,
  [PASS]: <Icons.CheckmarkFilledIcon height="16px" width="16px" color="success" />,
  [OBSERVATION]: <Icons.SearchFilledIcon height="16px" width="16px" />,
  [NOLOG]: <Icons.MoreIcon height="16px" width="16px" color="purple" />
}

export const TooltipContent = () => {
  return (
    <>
      {_.map(E911VerdictIcons, (icon, verdict) => (
        <Row key={verdict}>
          <Col style={{ minWidth: '150px' }}>
            <Text p="5px">
              {icon} {E911VerdictMapping[verdict]}
            </Text>
          </Col>
        </Row>
      ))}
      <Row>
        <Col style={{ marginTop: '10px' }}>
          <Text p="5px">
            Tip: Click on the icons in the table.
          </Text>
        </Col>
      </Row>
    </>
  )
}

export const NMEAModal = ({ 
  isOpen, 
  handleClose, 
  feature,
  archives,
  technology,
  filters,
  setFilters,
  segment,
  reportType
}) => {
  return (
    <div className="zaxis-modal">
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalHeader>{segment}</ModalHeader>
        <ModalContent>
          {isOpen && 
          <>
          <Row>
            <Box title="NMEA Summary Report" type="report-table no-min">
              <SummaryTable
                feature={feature}
                archives={archives}
                technology={technology}
                filters={filters}
                setFilters={setFilters}
                reportType={reportType}
              />
            </Box>
          </Row>
          </>
        }
        </ModalContent>
      </Modal>
    </div>
  )
}

const E911DeviceDetails = ({
  feature,
  archive,
  tab
}) => {
  const [filters, setFilters] = useState({
    archiveIds: [archive.id],
    devices: [archive.model_hardware],
    buildTrains: [archive.build_train],
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [segment, setSegment] = useState("ENTIRE_CALL")

  const handleCallClick = (newSegment) => {
    if (newSegment) {
      setIsModalOpen(true)
      setSegment(newSegment)
    }
  }

  return (
    <>
      {tab === 'Call Sessions' && (
        <div>
        <Row>
          <Box
            title={<>Call Sessions <HelpTooltip title="Icon Legend" content={<TooltipContent />}/></>}
            type="report-table"
            >
              <ScannerTable
                feature={feature}
                archives={[archive]}
                technology={technology}
                handleCallClick={handleCallClick}
              />
          </Box>
        </Row>
        <Row>  
        <NMEAModal 
          isOpen={isModalOpen} 
          handleClose={() => setIsModalOpen(false)}
          feature={feature}
          archives={[archive]}
          technology={technology}
          filters={{
            ...filters,
            customFilters: { segment: segment }
          }}
          setFilters={setFilters}
          segment={segment}
          reportType="NMEA"
        />
      </Row>
      </div>
      )}
    </>
  )
}

export default React.memo(E911DeviceDetails)
