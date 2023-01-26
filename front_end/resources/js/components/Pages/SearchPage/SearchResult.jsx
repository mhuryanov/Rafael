/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Col,
  Button,
  Spinner
} from 'react-bootstrap'
import {
  labelCase,
} from '../../../utilities/helpers'
import { StatePanel } from '@dx/continuum-state-panel'

const DetailsLink = lazy(() => import('../../Widgets/DetailsLink'))
const GnssSummary = lazy(() => import('../TechnologyPage/Gnss/GnssSummary'))

const TechnologyResult = ({ technology, archives, showSummary, showCdf, showTime }) => {
  switch (true) {
    case technology === 'GNSS':
      return <GnssSummary
        archives={archives}
        showSummary={showSummary}
        showCdf={showCdf}
        showTime={showTime}
      />
    default:
      return <StatePanel message="In construction..." suggestion="Please try again later." />
  }
}

const SearchResult = ({
  technology,
  archives,
  groupBy,
  groupName,
  showSummary,
  showCdf,
  showTime
}) => {
  const [showDetails, setShowDetails] = useState(false)

  const handleButtonClick = (e) => {
    e.preventDefault()
    setShowDetails(!showDetails)
  }

  console.log('Rendering SearchResult')
  return (
    <Suspense fallback={<Spinner animation="border" variant="info" />}>
      <Button onClick={handleButtonClick} style={{ textAlign: 'center' }} block style={{ marginTop: '25px' }}>
        {`${labelCase(groupBy)}: ${groupName}`} &#9660;
      </Button>
      {showDetails && (
        (groupBy === 'archive' || groupBy === 'fieldtest') ? (
          <DetailsLink itemType={groupBy[0].toUpperCase() + groupBy.slice(1)} itemId={groupName} icon="More Details..." popupType='Details' />
        ) : (
          <StatePanel message="In construction..." suggestion="Please try again later." />
        )
        // <Col>
        //   <TechnologyResult technology={technology} archives={archives} showSummary={showSummary} showCdf={showCdf} showTime={showTime} />
        // </Col>
      )}
    </Suspense>
  )
}

SearchResult.propTypes = {
  technology: PropTypes.string.isRequired,
  archives: PropTypes.array.isRequired,
  groupBy: PropTypes.string.isRequired,
  groupName: PropTypes.string.isRequired
}

export default React.memo(SearchResult)
