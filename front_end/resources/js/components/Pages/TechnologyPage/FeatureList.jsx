/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { useContext, useLayoutEffect, useState } from 'react'
import { Row, Col, Button, ListGroup } from 'react-bootstrap'
import {
  useHistory, useParams
} from 'react-router-dom'
import { PERFORMANCE, CTP, NO_PROCESSING } from '../../../utilities/constants'

import { StateContext } from '../../StateContext'

const validReportTypes = [
  PERFORMANCE,
  CTP
]


const FeatureList = () => {
  const history = useHistory()
  const { technologyFeatures } = useContext(StateContext)
  const { technology: urlTechnology, feature: urlFeature, reportType } = useParams()
  const technology = urlTechnology.toUpperCase()
  const selectedFeature = urlFeature.toUpperCase()
  const [features, setFeatures] = useState([])

  useLayoutEffect(() => {
    if (!technologyFeatures || !(technology in technologyFeatures)) {
      setFeatures([])
    } else {
      setFeatures(technologyFeatures[technology])
    }
  }, [technology, technologyFeatures, setFeatures])

  const handleFeatureClick = (event) => {
    const newFeature = event.target.innerHTML.match(new RegExp('(?:\>)(.+)(?=\<)'))[1]
    if (NO_PROCESSING.includes(technology)) {
      history.push(`/technology/${technology}/${newFeature}`)
    } else {
      history.push(`/technology/${technology}/${newFeature}/${validReportTypes.includes(reportType) ? reportType : PERFORMANCE}`)
    }
  }

  console.log('Rendering FeatureList')
  return (
    <div className="feature-list-bar">
      <div className="feature-list-contents">
        <p className="feature-list-title">FEATURE</p>
        <ListGroup className='feature-list'>
          {features.map(feature => (
            <ListGroup.Item
              action
              active={feature === selectedFeature}
              key={`${technology}${feature}`}
              onClick={handleFeatureClick}
            >
              <span className='feature-text'>{feature}</span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </div>
  )
}

export default React.memo(FeatureList)
