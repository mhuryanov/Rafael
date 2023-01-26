import React, { useEffect, useState, useContext } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Accordion, AccordionContent } from '@dx/continuum-accordion'
import { SelectDropdown } from '@dx/continuum-select-dropdown'
import { Text } from '@tidbits/react-tidbits'

import { StateContext } from '../../../StateContext'

import PredicateForm from './PredicateForm'
import SegmentMappingForm from './SegmentMappingForm'
import KpiCriteriaForm from './KpiCriteriaForm/index'

const initialState = {
  selectedFeature: null,
  features: [],
  featureOptions: [],
  technologyOptions: []
}

const DriFeatureForm = ({ technology, permission }) => {
  const [formState, setFormState] = useState(initialState)
  const { technologyFeatures } = useContext(StateContext)
  const {
    selectedFeature,
    features,
    featureOptions
  } = formState

  useEffect(() => {
    setFormState((prevState) => {
      const newFeatures = technologyFeatures[technology]
      const newSelectedFeature = newFeatures[0]
      const newFeatureOptions = newFeatures
        .map(featureOption => ({
          value: featureOption,
          label: featureOption
        }))
      return {
        ...prevState,
        features: newFeatures,
        selectedFeature: newSelectedFeature,
        featureOptions: newFeatureOptions
      }
    })
  }, [technology, technologyFeatures])

  const handleFeatureSelect = (options) => {
    const { value: newFeature } = options
    setFormState(prevState => ({
      ...prevState,
      selectedFeature: newFeature
    }))
  }

  console.log('Rendering DriFeatureForm')
  return (
    <div className="settings-container">
      <h3 className="plot-title">
        {`Manage Feature Settings (${technology === 'R1' ? 'PROXIMITY' : technology})`}
      </h3>
      <Row className="form-container">
        <Col sm="2" style={{ width: '150px' }}>
          <Text textStyle="h5Emph" mb="3px">Feature</Text>
          <SelectDropdown
            onChange={handleFeatureSelect}
            options={featureOptions}
            value={{ label: selectedFeature, value: selectedFeature }}
          />
        </Col>
      </Row>
      <div className="form-container">
        <Row>
          <Accordion
            features={{ toggleControls: false }}
          >
            <AccordionContent
              title='Edit Predicates'
              defaultExpanded={false}
            >
              {selectedFeature && (
                <PredicateForm key={selectedFeature} technology={technology} feature={selectedFeature} />
              )}
            </AccordionContent>
          </Accordion>
        </Row>
        <Row>
          <Accordion
            features={{ toggleControls: false }}
          >
            <AccordionContent
              title='Edit Segment Mapping'
              defaultExpanded={false}
            >
              {selectedFeature && (
                <SegmentMappingForm key={selectedFeature} technology={technology} feature={selectedFeature} />
              )}
            </AccordionContent>
          </Accordion>
        </Row>
        <Row>
          <Accordion
            features={{ toggleControls: false }}
          >
            <AccordionContent
              title='Edit KPI Criteria'
              defaultExpanded={false}
            >
              {selectedFeature && (
                <KpiCriteriaForm key={selectedFeature} technology={technology} feature={selectedFeature} />
              )}
            </AccordionContent>
          </Accordion>
        </Row>
      </div>
    </div>
  )
}

export default React.memo(DriFeatureForm)
