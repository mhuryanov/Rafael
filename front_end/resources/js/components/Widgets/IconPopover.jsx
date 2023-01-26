import React, { useState } from 'react'
import { Popover, Text } from '@tidbits/react-tidbits'

const IconPopover = ({ title, content, icon, customClass = '' }) => {
  const [popover, setPopover] = useState(false)

  return (
    popover ? ( 
      <Popover.Tooltip
        placement="bottom"
        target={({ ref, isHidden, setHidden }) => (
          <div
            style={{ cursor: 'pointer' }}
            ref={ref}
            onClick={() => setHidden(!isHidden)}
          >
            {icon}
          </div>
        )}>
        <div className={`icon-popover ${customClass}`}>
          <Text textStyle="h5Emph" pb="15px">{title}</Text>
          {content}
        </div>
      </Popover.Tooltip>
    ) : <div onMouseOver={() => setPopover(true)}>{icon}</div>
  )
}

export default React.memo(IconPopover)
