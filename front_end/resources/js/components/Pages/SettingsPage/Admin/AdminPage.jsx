import React, { Suspense, lazy } from 'react';
import { isUserAdmin } from '../../../../utilities/helpers'

import { Col, Row } from 'react-bootstrap'
import { Accordion, AccordionContent } from '@dx/continuum-accordion'
const ErrorComponent = lazy(() => import('../../ErrorComponent'))
const JobSettingsForm = lazy(() => import('../DRI/JobSettingsForm'))
const ArchiveTypeForm = lazy(() => import("../DRI/ArchiveTypeForm"))
const IntroduceGroupFrom = lazy(() => import("../DRI/IntroduceGroupFrom"))

const AdminPage = () => {

  return (isUserAdmin() ? <div className="settings-container">
    <Row>
      <Col>
        <h3 className="plot-title">
          {"Manage Admin Settings"}
        </h3>
      </Col>
    </Row>
    <div className="form-container">
      <Row>
        <Col className="box">
          <Accordion
            features={{ toggleControls: false }}
          >
            <AccordionContent
              title='Add Archive Type'
              defaultExpanded={false}
            >
              <ArchiveTypeForm />
            </AccordionContent>
          </Accordion>
        </Col>
      </Row>
      <Row>
        <Col className="box">
          <Accordion
            features={{ toggleControls: false }}
          >
            <AccordionContent
              title="Introduce a Group"
              defaultExpanded={false}
            >
              <IntroduceGroupFrom />
            </AccordionContent>
          </Accordion>
        </Col>
      </Row>
      <Row>
        <Col className="box">
          <Accordion
            features={{ toggleControls: false }}
          >
            <AccordionContent
              title='Edit Jobs'
              defaultExpanded={false}
            >
              <JobSettingsForm editAccess={isUserAdmin()} />
            </AccordionContent>
          </Accordion>
        </Col>
      </Row>
    </div>
  </div >
    : <ErrorComponent />)

}









export default React.memo(AdminPage)
