import React, { useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Popover, MenuList, Text, Link, Icons } from '@tidbits/react-tidbits'
import { Input } from "@tidbits/react-tidbits"
import { Count } from '@dx/continuum-count'

import { filterToggle } from '../../utilities/helpers'


const Filter = ({ title, type, items, filters, setFilters, showItems = true }) => {
  const [showPopover, setShowPopover] = useState(false)

  const handleClick = () => {
    setShowPopover(prevState => !prevState)
  }

  const handleAllSelect = () => {
    setFilters(prevState => ({
      ...prevState,
      [type]: items
    }))
  }

  const handleAllRemove = () => {
    setFilters(prevState => ({
      ...prevState,
      [type]: []
    }))
  }

  const handleSelect = (item) => {
    setFilters((prevState) => {
      const prevItems = prevState[type]
      const newItems = filterToggle(prevItems, item)
      return {
        ...prevState,
        [type]: newItems
      }
    })
  }

  return (
    <Row style={{ margin: '0px' }}>
      <Popover.DropdownMenu
        target={({ targetProps }) => (
          <Link {...targetProps}>
            <Text onClick={handleClick} textStyle="bodySmallMedium">
              {`${title} `}
              <Icons.DownIcon width="8px" height="8px" />
            </Text>
          </Link>
        )}
      >
        {() => (
          <MenuList>
            <MenuList.Item key="all" as="label">
              <Text onClick={handleAllSelect}>
                Select All
              </Text>
            </MenuList.Item>
            <MenuList.Item key="remove" as="label">
              <Text onClick={handleAllRemove}>
                Remove All
              </Text>
            </MenuList.Item>
            {showItems && <MenuList.HR /> }
            {showItems && items.map(item => (
              <MenuList.Item key={item} as="label">
                <Input.CircleCheckbox
                  style={{ cursor: 'pointer' }}
                  checked={filters[type].includes(item)}
                  onChange={() => handleSelect(item)}
                />
                {` ${item}`}
              </MenuList.Item>
            ))}
          </MenuList>
        )}
      </Popover.DropdownMenu>
      {showItems && <div style={{ marginTop: '-9px', marginLeft: '8px' }}>
        <Count
          variant={filters[type].length === items.length ? 'primary' : 'info'}
        >
          {`${filters[type].length < items.length ? filters[type].length : 'All'} Selected`}
        </Count>
      </div>}
    </Row>
  )
}

export default React.memo(Filter)
