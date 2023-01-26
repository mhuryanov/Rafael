import React from 'react'
import { Row, Col } from 'react-bootstrap'
import { Popover, Text, Icons } from '@tidbits/react-tidbits'

const HelpTooltip = ({ title, content, placement = "right" }) => {

  return (
    <Popover.Tooltip
      placement={placement}
      target={({ ref, show, hide, isHidden, setHidden }) => (
        <Text
          as="span"
          cursor="pointer"
          ref={ref}
          tabIndex="0"
          onMouseOver={show}
          onMouseLeave={hide}
        >
          <Icons.HelpFilledIcon width="20px" height="20px" ml="5px" mt="-5px" color="labelLegal" />
        </Text>
      )}>
        <div className="help-tooltip">
          {title && <Text textStyle="h5Emph" pb="15px">{title}</Text>}
          {content}
        </div>
    </Popover.Tooltip>
  )
}

export default React.memo(HelpTooltip)
