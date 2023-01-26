/* eslint-disable react/forbid-prop-types */
import React from 'react'
import Table from '@tidbits/react-tidbits/Table'

import { getColorStyle } from './SummaryTable/helpers'

const shortid = require('shortid')
const _ = require('underscore')

const colStyle = { fontWeight: 'normal', fontStyle: 'italic' }

const BaseTable = ({ headerColumns, subHeaderColumns, tableData }) => {
  return (
    <>
      <div style={{ overflowX: 'scroll' }}>
        <Table bordered responsive>
          <Table.THead>
            <Table.TR borderBottom="none">
              {_.map(headerColumns, (colSpan, col) => (
                <Table.TH
                  key={shortid.generate()}
                  colSpan={colSpan}
                  className={col ? 'border-bottom' : ''}
                  style={{ textTransform: 'none' }}
                >
                  {col}
                </Table.TH>
              ))}
            </Table.TR>
            {subHeaderColumns && (
              <Table.TR borderTop="none">
                {_.map(subHeaderColumns, col => (
                  <Table.TH key={shortid.generate()} style={{ textTransform: 'none' }}>
                    {col}
                  </Table.TH>
                ))}
              </Table.TR>
            )}
          </Table.THead>
          <Table.TBody>
            {tableData.map(tableRow => (
              <Table.TR key={shortid.generate()}>
                {tableRow.map(col => (
                  <Table.TD key={shortid.generate()} style={colStyle}>
                    {col.value}
                  </Table.TD>
                ))}
              </Table.TR>
            ))}
          </Table.TBody>
        </Table>
      </div>
    </>
  )
}

export default React.memo(BaseTable)
