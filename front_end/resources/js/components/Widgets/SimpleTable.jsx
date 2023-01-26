import React from 'react'
import styled from 'styled-components'
import { useGlobalFilter, useGridLayout, usePagination, useTable, useSortBy } from 'react-table'
import { Button } from 'react-bootstrap'
import { FaArrowAltCircleDown, FaArrowAltCircleUp } from "react-icons/fa";

const GlobalFilter = ({ filter, setFilter }) => {
    return (
        <div>
            <span>
                Search: {' '}
                <input value={filter || ''} onChange={(e) => setFilter(e.target.value)} />
            </span>
        </div>
    )
}

const Styles = styled.div`
    padding: 1rem;
    ${'' /* These styles are suggested for the table fill all available space in its containing element */}
    display: block;
    ${'' /* These styles are required for a horizontally scrollable table overflow */}
    overflow: auto;
    width: 80%;
    .table {
      font-size: 13px;
      display: contents;
    }
    .table {
      border: 1px solid #D6D6D6;
      background-color: #D6D6D6;
      grid-gap: 1px;
      .cell {
        background-color: white;
      }
      .header {
        background-color: #F5F5F5;
        font-weight: bold;
        text-transform: uppercase;
      }
      .cell,
      .header {
        padding: 0.5rem;
      }
    }
  `

const Table = ({ columns, data }) => {
    const {
        canNextPage,
        canPreviousPage,
        getTableProps,
        gotoPage,
        headerGroups,
        nextPage,
        page,
        pageCount,
        pageOptions,
        prepareRow,
        previousPage,
        setGlobalFilter,
        state,
    } = useTable(
        {
            columns,
            data,
            initialState: { pageSize: 10 },
        },
        useGridLayout,
        useGlobalFilter,
        useSortBy,
        usePagination,
    )

    const { pageIndex } = state
    const { globalFilter } = state

    return (
        <Styles>
            <div className='row justify-content-between' style={{ paddingBottom: 10 }}>
                <div className="col">
                    <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />

                </div>
                <div className="col">
                    <div className="row justify-content-end">
                        <div style={{ paddingTop: '10px', paddingRight: '10px' }}>
                            <span>{pageIndex + 1} of {pageOptions.length}</span>
                        </div>
                        <Button variant="outline-primary" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>&laquo;</Button>
                        <Button variant="outline-primary" onClick={() => previousPage()} disabled={!canPreviousPage}>&lt;</Button>
                        <Button variant="outline-primary" onClick={() => previousPage()} disabled={!canPreviousPage}>{pageIndex}</Button>
                        <Button variant="primary" >{pageIndex + 1}</Button>
                        <Button variant="outline-primary" onClick={() => nextPage()} disabled={!canNextPage}>{pageIndex + 2}</Button>
                        <Button variant="outline-primary" onClick={() => nextPage()} disabled={!canNextPage}>&gt;</Button>
                        <Button variant="outline-primary" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>&raquo;</Button>
                    </div>
                </div>
            </div>
            <div className="row">
                <div {...getTableProps()} className="table">
                    {headerGroups.map(headerGroup => (
                        headerGroup.headers.map(column => (
                            <div key={column.id} {...column.getHeaderProps(column.getSortByToggleProps)} className="cell header">
                                <span>
                                    {column.isSorted ? (column.isSortedDesc ?  <FaArrowAltCircleDown /> : <FaArrowAltCircleUp /> ) : ''}
                                </span>
                                {column.render('Header')}
                            </div>
                        ))
                    ))}
                    {page.map(row =>
                        prepareRow(row) || (
                            row.cells.map(cell => (
                                <div {...cell.getCellProps()} className="cell">
                                    {cell.render('Cell')}
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>
            <div className='row justify-content-center'>
                <Button variant="outline-primary" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>&laquo;</Button>
                <Button variant="outline-primary" onClick={() => previousPage()} disabled={!canPreviousPage}>&lt;</Button>
                {canPreviousPage && <Button variant="outline-primary" onClick={() => previousPage()} disabled={!canPreviousPage}>{pageIndex}</Button>}
                <Button variant="primary" >{pageIndex + 1}</Button>
                {canNextPage && <Button variant="outline-primary" onClick={() => nextPage()} disabled={!canNextPage}>{pageIndex + 2}</Button>}
                <Button variant="outline-primary" onClick={() => nextPage()} disabled={!canNextPage}>&gt;</Button>
                <Button variant="outline-primary" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>&raquo;</Button>
            </div>
        </Styles>
    )
}

export default React.memo(Table)
