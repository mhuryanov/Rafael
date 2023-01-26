/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { useState, useEffect } from 'react'
import { Spinner, Row, Col, Alert } from 'react-bootstrap'
import { Suspense, lazy } from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'
import {
  Modal,
  ModalHeader,
  ModalContent
} from '@dx/continuum-modal'
import { Button } from '@dx/continuum-button'

import { useQuery, size, getArchiveFilterParams, labelCase, reProcessItems } from '../../../utilities/helpers'
import { useFetchRafael } from '../../../hooks/fetchData'
import { queryStringConverter } from './ArchiveFilter/helpers'
import { GROUP_BY_SELECTIONS } from '../../../utilities/constants'

const ReProcessMenu = lazy(() => import('../../Widgets/ReProcess'))
const shortid = require('shortid')
const _ = require('underscore')
const SearchResult = lazy(() => import('./SearchResult'))
const Pagination = lazy(() => import("react-js-pagination"))

const ITEMS_PER_PAGE = 10


const SearchBody = () => {
  const query = useQuery()
  const parsedQueryString = query.get('queryString')
  const parsedGroupBy = query.get('groupBy')
  const queryString = parsedQueryString || ''
  const displayQueryString = queryString === '' ? '*' : queryStringConverter(queryString)
  const groupBy = parsedGroupBy || GROUP_BY_SELECTIONS[0]
  const [subQueryResults, setSubQueryResults] = useState({})
  const [pageInfo, setPageInfo] = useState({ startIndex: 0, endIndex: 0, currentPage: 1 })
  const [showSummary, setShowSummary] = useState(true)
  const [showCdf, setShowCdf] = useState(true)
  const [showTime, setShowTime] = useState(false)
  const [isLoading, queryResults] = useFetchRafael(getArchiveFilterParams(queryString, groupBy), [])
  const [showModal, setShowModal] = useState(false)
  const allArchives = Object.values(queryResults).flat()

  // Handlers
  const handleSelectChange = e => {
    const checkBoxId = e.target.id
    const isChecked = e.target.checked
    switch (true) {
      case checkBoxId === 'summary':
        setShowSummary(isChecked)
        break;
      case checkBoxId === 'cdf':
        setShowCdf(isChecked)
        break;
      case checkBoxId === 'time':
        setShowTime(isChecked)
        break;
    }
  }

  const handleReprocess = (jobId, archive_type) => {
    reProcessItems(allArchives.map(archive => archive.id), 'ARCHIVE', jobId, archive_type, handleClose)
  }

  const handleClose = () => {
    setShowModal(false)
  }

  const updateCurrentPage = (currentPage) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = ITEMS_PER_PAGE * currentPage
    setPageInfo({ startIndex, endIndex, currentPage })
  }

  useDeepCompareEffect(() => {
    updateCurrentPage(1)
  }, [queryResults])

  useDeepCompareEffect(() => {
    const newSubResults = _.pick(queryResults, Object.keys(queryResults).slice(pageInfo.startIndex, pageInfo.endIndex))
    setSubQueryResults(newSubResults)
  }, [queryResults, pageInfo])

  // Sub Components
  const checkBoxes = (
    <div>
      <span>
        Summary Table
      </span>
      <input
        type="checkbox"
        id="summary"
        checked={showSummary}
        onChange={handleSelectChange}
        style={{ marginLeft: '3px', marginRight: '20px' }}
      />
      <span>
        CDF
      </span>
      <input
        type="checkbox"
        id="cdf"
        checked={showCdf}
        onChange={handleSelectChange}
        style={{ marginLeft: '3px', marginRight: '20px' }}
      />
      <span>
        Time Series
      </span>
      <input
        type="checkbox"
        id="time"
        checked={showTime}
        onChange={handleSelectChange}
        style={{ marginLeft: '3px', marginRight: '20px' }}
      />
    </div>
  )

  const pagination = (size(queryResults) > ITEMS_PER_PAGE) ? <Pagination
    activePage={pageInfo.currentPage}
    itemsCountPerPage={ITEMS_PER_PAGE}
    totalItemsCount={size(queryResults)}
    pageRangeDisplayed={5}
    onChange={updateCurrentPage}
    itemClass="page-item"
    linkClass="page-link"
  /> : null

  // To Return
  if (isLoading) {
    return (
      <div>
        <Spinner animation="border" variant="info" />
      </div>
    )
  }

  const useReprocess = groupBy === 'archive'
    && displayQueryString.includes('technology =')
    && displayQueryString.includes('feature =')
    && displayQueryString.includes('archive_type =')

  console.log('Rendering SearchBody')
  return (
    <>
      <Suspense fallback={<Spinner animation="border" variant="info" />}>
        <h4>
          Search Results: {size(queryResults)} Found
          {useReprocess && (
            <Button style={{ marginLeft: '10px' }} onClick={() => setShowModal(true)}>ReProcess</Button>
          )}
        </h4>
        <div> Query: {displayQueryString} </div>
        <div> Group By: {labelCase(groupBy)} </div>
        {(_.isEmpty(subQueryResults)) ? (
          <Alert variant='info' >No Data... </Alert>
        ) : (
          <div>
            {_.map(subQueryResults, (archives, groupName) => {
              const uniqueKey = groupName + queryString + groupBy
              return (
                <SearchResult
                  key={uniqueKey}
                  technology={'GNSS'}
                  archives={archives}
                  groupBy={groupBy}
                  groupName={groupName}
                  showSummary={showSummary}
                  showCdf={showCdf}
                  showTime={showTime}
                />
              )
            })}
            <Modal isOpen={showModal} onClose={handleClose}>
              <ModalHeader>{`Re-Process all ${size(queryResults)} ${labelCase(groupBy)}s?`}</ModalHeader>
              <ModalContent>
                {showModal && (
                  <>
                    <ReProcessMenu itemId={allArchives[0].id} itemType='Archive' handleClick={handleReprocess} />
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        )}
        <div style={{ marginTop: '10%' }}>
          {pagination}
        </div>
      </Suspense>
    </>
  )
}

export default React.memo(SearchBody)