import React, { useEffect, useState, useContext, Suspense, lazy } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Accordion, AccordionContent } from '@dx/continuum-accordion'
import { Toggle } from '@dx/continuum-toggle'
import { sendToServer, isUserAdmin } from '../../../../utilities/helpers'
import { TECHNOLOGY_INFO_API } from '../../../../utilities/constants'
const FeatureForm = lazy(() => import('./FeatureForm'))
const CassandraTableForm = lazy(() => import('./CassandraTableForm'))
const AccessControlForm = lazy(() => import('./AccessControlForm'))
const TableGroupForm = lazy(() => import('./TableGroupForm'))
import { StateContext } from '../../../StateContext'
const JobSettingsForm = lazy(() => import('./JobSettingsForm'))
const AccessGroupControlForm = lazy(() => import('./AccessGroupControlForm'))
const DriTechnologyForm = ({ technology, permission, driTechnologies }) => {

  console.log('Rendering DriTechnologyForm')
  const { technologyIsPublic } = useContext(StateContext)
  const { [technology]: is_public } = technologyIsPublic
  const [isPublicChecked, setIsPublicChecked] = useState(is_public)
  const handleChange = () => {
    sendToServer(`${TECHNOLOGY_INFO_API}${technology}/public_private/`, {}, 'GET', () => setIsPublicChecked(!isPublicChecked))
  }
  return (
    <div className="settings-container">
      <Row>
        <Col>
          <h3 className="plot-title">
            {`Manage Technology Settings (${technology === 'R1' ? 'PROXIMITY' : technology})`}
          </h3>
        </Col>
        <Col>
          <h6 style={{ float: "right" }}>Public:  <Toggle checked={isPublicChecked} onChange={handleChange} /></h6>
        </Col>
      </Row>
      <div className="form-container">
        <Row>
          <Accordion
            features={{ toggleControls: false }}
          >
            <AccordionContent
              title='Add Features'
              defaultExpanded={false}
            >
              <FeatureForm technology={technology} />
            </AccordionContent>
          </Accordion>
        </Row>
        <Row>
          <Accordion
            features={{ toggleControls: false }}
          >
            <AccordionContent
              title="Edit Cassandra Tables"
              defaultExpanded={false}
            >
              <CassandraTableForm technology={technology} driTechnologies={driTechnologies} />
            </AccordionContent>
          </Accordion>
        </Row>
        <Row>
          <Accordion
            features={{ toggleControls: false }}
          >
            <AccordionContent
              title="Edit Table Groups"
              defaultExpanded={false}
            >
              <TableGroupForm technology={technology} />
            </AccordionContent>
          </Accordion>
        </Row>
        <Row>
          <Accordion
            features={{ toggleControls: false }}
          >
            <AccordionContent
              title='Jobs'
              defaultExpanded={false}
            >
              <JobSettingsForm technology={technology} editAccess={permission === 'ADMIN' || isUserAdmin()} />
            </AccordionContent>
          </Accordion>
        </Row>
        {permission === 'ADMIN' && (
          <>
            <Row>
              <Accordion
                features={{ toggleControls: false }}
              >
                <AccordionContent
                  title='Edit Access Control'
                  defaultExpanded={false}
                >
                  <AccessControlForm technology={technology} />
                </AccordionContent>
              </Accordion>
            </Row>
            <Row>
              <Accordion
                features={{ toggleControls: false }}
              >
                <AccordionContent
                  title='Edit Access Control By Group (beta)'
                  defaultExpanded={false}
                >
                  <AccessGroupControlForm technology={technology} />
                </AccordionContent>
              </Accordion>
            </Row>
          </>
        )}
      </div>
    </div>
  )
}

export default React.memo(DriTechnologyForm)
