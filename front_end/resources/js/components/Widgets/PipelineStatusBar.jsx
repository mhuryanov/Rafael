import React, { useEffect, useState } from 'react'
import { Popover, Text, Icons } from '@tidbits/react-tidbits'
import { Breadcrumbs } from '@tidbits/react-tidbits'

import { ARCHIVE_COMPLETED_STATUS, ARCHIVE_API, TECHNOLOGY_INFO_API } from '../../utilities/constants'
import { getPipelineStatus, isFailedPipelineState } from '../../utilities/helpers'
import { useFetchRafael } from '../../hooks/fetchData'

const _ = require('underscore')

const getIcon = (category) => {
  switch (category) {
    case 'ERROR':
      return <Icons.CloseFilledIcon width="16px" height="16px" color="error" />
    case 'DEBUG':
      return <Icons.WarningFilledIcon width="16px" height="16px" color="warning" />
    case 'SUCCESS':
      return <Icons.CheckmarkFilledIcon width="16px" height="16px" color="success" />
    default:
      return <Icons.ClockFilledIcon width="16px" height="16px" color="labelPlaceholder" />
  }
}

const getCategory = (pipelineState) => {
  switch (true) {
    case isFailedPipelineState(pipelineState):
      return 'ERROR'
    case pipelineState.toUpperCase().includes('DEBUG'):
      return 'DEBUG'
    case pipelineState === ARCHIVE_COMPLETED_STATUS:
      return 'SUCCESS'
    default:
      return 'DEFAULT'
  }
}

const PipelineStatusBar = ({ archive }) => {
  const {
    technology,
    feature,
    archive_type: archiveType,
    pipelinestate: pipelineState
  } = archive
  const [isLoading, jobs] = useFetchRafael({ url: `${TECHNOLOGY_INFO_API}${technology}/${feature}/${archiveType}/proccessing_jobs` }, [])
  const currentPipelineStatus = getPipelineStatus(pipelineState)
  const [pipelineStatuses, setPipelineStatuses] = useState([currentPipelineStatus])
  const currentPipelineCategory = getCategory(pipelineState)
  const { errorMessage } = jobs

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const newPipelineStatuses = jobs.map(job => job.job_name)
      if (newPipelineStatuses.includes(currentPipelineStatus)) {
        setPipelineStatuses(newPipelineStatuses)
      }
    }
  }, [isLoading, jobs])

  return (
    <Popover.Tooltip
      placement="top"
      target={({ ref, show, hide, isHidden, setHidden }) => (
        <div className="pipeline-status">
          <Text
            as="span"
            cursor="pointer"
            ref={ref}
            tabIndex="0"
            onMouseOver={show}
            onMouseLeave={hide}
            textStyle="bodyEmph"
            color="#454545"
          >
            {getIcon(currentPipelineCategory)} &nbsp; {`${currentPipelineStatus}`}
          </Text>
        </div>
      )}>
      <div className="pipeline-tooltip">
        <Breadcrumbs textStyle="bodyRegular">
          {pipelineStatuses.map(pipelineStatus => (
            <Breadcrumbs.Crumb
              key={pipelineStatus}
              textStyle={
                currentPipelineStatus === pipelineStatus
                  ? 'bodyEmph'
                  : 'default'
              }
              color={currentPipelineStatus === pipelineStatus ? '#454545' : 'clrGray'}
            >
              {currentPipelineStatus === pipelineStatus && (
                <>
                  {getIcon(currentPipelineCategory)}
                  &nbsp;
                </>
              )}
              {pipelineStatus}
              {currentPipelineStatus === pipelineStatus && (
                <>
                  &nbsp;
                  <Text textStyle="bodySmallEmph">
                    {`(${pipelineState})`}
                  </Text>
                </>
              )}
            </Breadcrumbs.Crumb>
          ))}
        </Breadcrumbs>
      </div>
    </Popover.Tooltip>
  )
}



export default React.memo(PipelineStatusBar)
