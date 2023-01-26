import React from 'react'
import { Table, Input } from '@tidbits/react-tidbits'

const FilterTable = ({ items, colors, filter, handleCheck }) => {

  return (
    <Table>
      <Table.THead>
        <Table.TR>
          <Table.TH>Select</Table.TH>
          <Table.TH>Name</Table.TH>
        </Table.TR>
      </Table.THead>
      <Table.TBody>
        {items.map((item, i) => (
          <Table.TR key={item}>
            <Table.TD>
              <Input.CircleCheckbox
                style={{ cursor: 'pointer' }}
                checked={filter.includes(item)}
                onChange={() => handleCheck(item)}
              />
            </Table.TD>
            <Table.TD>
              {colors && <span className="color-block" style={{ backgroundColor: colors[i] }} />} {item}
            </Table.TD>
          </Table.TR>
        ))}
      </Table.TBody>
    </Table>
  )
}

export default React.memo(FilterTable)
