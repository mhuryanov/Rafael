import React, { useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Text, List, Icons, Link } from '@tidbits/react-tidbits'
import Table from '@tidbits/react-tidbits/Table'
import { SearchInput } from '@dx/continuum-search-input'
import { InlineSpinner } from '@tidbits/react-tidbits/Spinner'

import { isEmpty } from '../../utilities/helpers'
import { useFetchArchiveData } from '../../hooks/fetchData'
import { ARCHIVE_REPORTING_LOGS } from '../../utilities/constants'

const _ = require('underscore')

const ITEMS_PER_PAGE = 10
const PAGE_RANGE = 8

const tableDataToCsv = (tableData, columns) => {
  let csvString = `${columns.join()}\n`
  tableData.forEach((row, i) => {
    csvString += row.reduce((acc, value, i) => {
      const valueString = i < row.length - 1 ? `"${value}",` : `"${value}"\n`
      return acc + valueString
    }, '')
  })
  return csvString
} 

const getPageRange = (page, numPages) => {
  let start
  let end
  if (page < PAGE_RANGE / 2 + 1) {
    start = 1
    end = numPages > PAGE_RANGE + 1 ? PAGE_RANGE + 1 : numPages
    return [start, end]
  }
  if (page > numPages - (PAGE_RANGE / 2)) {
    start = numPages - PAGE_RANGE - 1 > 1 ? numPages - PAGE_RANGE - 1 : 1
    end = numPages
    return [start, end]
  }
  return [page - PAGE_RANGE / 2, page + PAGE_RANGE / 2]
}

const sortByColumn = (tableData, idx, isAscending = true) => {
  if (isAscending) return tableData.sort((row1, row2) => row1[idx] > row2[idx])
  else return tableData.sort((row1, row2) => row1[idx] < row2[idx])
}

export const getTableData = (archiveData, columns, numRows) => {
  const tableData = []
  _.range(numRows).forEach((idx) => {
    const tableRow = []
    columns.forEach((column) => {
      const tableEntry = archiveData[column][idx]
      if (tableEntry !== undefined) tableRow.push(tableEntry)
    })
    if (tableRow.length > 0) tableData.push(tableRow)
  })
  return tableData
}

const getTableBody = (tableData, page) => {
  return (
    <Table.TBody key={page}>
      {tableData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((tableRow, idx) => (
        <Table.TR key={idx}>
          {tableRow.map(tableEntry => (
            <Table.TD>{tableEntry}</Table.TD>
          ))}
        </Table.TR>
      ))}
    </Table.TBody>
  )
}

const filterTableData = (tableData, searchTerm) => {
  const filteredTableData = tableData.filter((tableRow) => {
    let isMatch = false
    tableRow.forEach((tableCol) => {
      if (String(tableCol).toUpperCase().includes(searchTerm.toUpperCase())) {
        isMatch = true
      }
    })
    return isMatch
  })
  return filteredTableData
}

const PreviewTable = ({ archiveId, archiveLabel, logName, columns }) => {
  const [isLoading, archiveInfo] = useFetchArchiveData(
    [archiveId], ARCHIVE_REPORTING_LOGS, logName, columns, [], true, true
  )
  const archiveData = archiveInfo[archiveId]
  const [tableBody, setTableBody] = useState(null)
  const [allTableData, setAllTableData] = useState([])
  const [tableData, setTableData] = useState([])
  const [fetchedColumns, setFetchedColumns] = useState([])
  const [numPages, setNumPages] = useState(0)
  const [selectedPage, setSelectedPage] = useState(1)
  const [columnToSort, setColumnToSort] = useState('')

  useEffect(() => {
    if (!isEmpty(archiveData)) {
      const newFetchedColumns = Object.keys(archiveData)
      const numRows = archiveData[newFetchedColumns[0]].length
      setFetchedColumns(newFetchedColumns)
      setTableData((prevTableData) => {
        const newTableData = prevTableData.concat(getTableData(archiveData, newFetchedColumns, numRows))
        setTableBody(getTableBody(newTableData, selectedPage))
        return newTableData
      })
      setAllTableData(prevAllTableData => prevAllTableData.concat(getTableData(archiveData, newFetchedColumns, numRows)))
      setNumPages(prevPages => prevPages + Math.ceil(numRows / ITEMS_PER_PAGE))
    }
  }, [isLoading, archiveData])

  useEffect(() => {
    if (numPages > 0) {
      const newTableBody = getTableBody(tableData, selectedPage)
      setTableBody(newTableBody)
    }
  }, [selectedPage])

  const handleBack = () => {
    if (selectedPage === 1) return
    setSelectedPage(prevPage => prevPage - 1)
  }

  const handleNext = () => {
    if (selectedPage === numPages) return
    setSelectedPage(prevPage => prevPage + 1)
  }

  const handleSearch = (e) => {
    const { value } = e.target
    const newTableData = filterTableData(allTableData, value)
    const newTableBody = getTableBody(newTableData, 1)
    setTableData(newTableData)
    if (JSON.stringify(newTableBody) !== JSON.stringify(tableBody)) {
      setTableBody(newTableBody)
    }
    setNumPages(Math.ceil(newTableData.length / ITEMS_PER_PAGE))
    setSelectedPage(1)
  }

  const handleColumnSort = (column) => {
    const idx = fetchedColumns.indexOf(column)
    let newTableData
    if (!columnToSort || columnToSort.split('&')[0] !== column || columnToSort === `${column}&desc`) {
      newTableData = sortByColumn(tableData, idx)
      setColumnToSort(`${column}&asc`)
    } else {
      newTableData = sortByColumn(tableData, idx, false)
      setColumnToSort(`${column}&desc`)
    }
    setTableData(newTableData)
    setTableBody(getTableBody(newTableData, 1))
    setSelectedPage(1)
  }

  const handleDownload = () => {
    const data = new Blob( [tableDataToCsv(allTableData, fetchedColumns)], {type:'text/json;charset=utf-8,'} ) 
    const url = URL.createObjectURL(data);
    const e = document.getElementById(`${logName} download`)
    e.setAttribute('href', url)
    e.setAttribute('download', `${archiveLabel.split(' ').join('_')}_${logName}.csv`)
    e.click()
  }

  const [start, end] = getPageRange(selectedPage, numPages)

  return (
    <>
      {tableBody !== null && (
        <Row className="justify-content-end">
          {isLoading && <Text mr="10px" mt="5px">Fetching data... <InlineSpinner visible /> {`(${numPages} pages loaded.)`}</Text>}
          <SearchInput disabled={isLoading} placeholder="Filter by key word" onEnter={handleSearch} />
          <Text mr="15px" ml="15px" mt="5px">
            <Link id={`${logName} download`} href="/" variant="default" onClick={handleDownload}>Download</Link>
          </Text>
        </Row>
      )}
      <div style={{ overflowX: 'scroll', margin: '15px' }}>
        <Table>
          {tableBody === null ? (
            <Table.Placeholder>
              <Text sb="space20">
                {isLoading ? 'Loading data...' : `No data to show.`}
              </Text>
            </Table.Placeholder>
          ) : (
            <>
              <Table.THead>
                <Table.TR>
                  {fetchedColumns.map(column => (
                    <Table.TH key={column} style={{ cursor: 'pointer' }} onClick={() => handleColumnSort(column)}>{column}</Table.TH>
                  ))}
                </Table.TR>
              </Table.THead>
              {tableBody}
            </>
          )}
        </Table>
      </div>
      {numPages !== 0 && (
        <Row className="justify-content-center">
          <List.Inline>
            {_.range(start, end + 1).map(page => (
              <List.LI
                key={page}
                style={{ cursor: 'pointer', textDecoration: selectedPage === page ? 'underline' : 'none', fontWeight: selectedPage === 'page' ? 'bold' : 'normal' }}
                color={selectedPage === page ? 'blue' : 'black'}
                onClick={() => setSelectedPage(page)}
              >
                {page}
              </List.LI>
            ))}
          </List.Inline>
          <List.Inline>
            <List.LI
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedPage(1)}
            >&larr;</List.LI>
            <List.LI
              style={{ cursor: 'pointer' }}
              onClick={handleBack}
            ><Icons.LeftIcon width="12px" height="12px" /></List.LI>
            <List.LI
              style={{ cursor: 'pointer' }}
              onClick={handleNext}
            ><Icons.RightIcon width="12px" height="12px" /></List.LI>
            <List.LI
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedPage(numPages)}
            >&rarr;</List.LI>
          </List.Inline>
        </Row>
      )}
    </>
  )
}

export default React.memo(PreviewTable)
