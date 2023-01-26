import React, { useContext } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Navigation, NavigationItem } from '@dx/continuum-navigation'
import { useParams, useHistory } from 'react-router-dom'
import ErrorComponent from '../../ErrorComponent'
import {
  size, sortedByKey, filterProcessedTechnologies, getTechnologiesToShow
} from '../../../../utilities/helpers'
import { StateContext } from '../../../StateContext'
import DriFeatureForm from './DriFeatureForm'
import DriTechnologyForm from './DriTechnologyForm'


const getDriTechnologyPermissions = (allTechnologies, userPermissions) => {
  const driTechnologyPermissions = {}
  const { maintainers_of, admins_of, is_keylime_admin } = userPermissions
  if (is_keylime_admin) {
    allTechnologies.forEach((technology) => {
      if (allTechnologies.includes(technology)) {
        driTechnologyPermissions[technology] = 'ADMIN'
      }
    })
  } else {
    maintainers_of.forEach((maintainerTechnology) => {
      if (allTechnologies.includes(maintainerTechnology)) {
        driTechnologyPermissions[maintainerTechnology] = 'MAINTAINER'
      }
    })
    admins_of.forEach((adminTechnology) => {
      if (allTechnologies.includes(adminTechnology)) {
        driTechnologyPermissions[adminTechnology] = 'ADMIN'
      }
    })
  }
  return sortedByKey(driTechnologyPermissions)
}


const DriPage = () => {
  const { technology } = useParams()
  const history = useHistory()
  const { userPreferences, userPermissions } = useContext(StateContext)
  const { technologyPreferences } = userPreferences
  const allTechnologies = getTechnologiesToShow(technologyPreferences)
  const validTechnologies = filterProcessedTechnologies(allTechnologies)
  const driTechnologyPermissions = getDriTechnologyPermissions(validTechnologies, userPermissions)
  const driTechnologies = Object.keys(driTechnologyPermissions)

  const setTechnology = (tech) => {
    history.push(`/settings/dri/${tech}`)
  }

  if (
    (!technology || !driTechnologies.includes(technology))
    && size(driTechnologyPermissions) > 0
  ) setTechnology(Object.keys(driTechnologyPermissions)[0])

  console.log('Rendering DriPage')
  return (
    <>
      {driTechnologies.length > 0 ? (
        <div style={{ marginBottom: '100px' }}>
          <Navigation direction='horizontal'>
            {driTechnologies.map(tech => (
              <NavigationItem
                key={tech}
                variant="tab"
                onClick={() => setTechnology(tech)}
                active={technology === tech}
              >
                {tech === 'R1' ? 'PROXIMITY' : tech}
              </NavigationItem>
            ))}
          </Navigation>
          {technology && driTechnologies.includes(technology) && (
            <>
              <Row>
                <Col className="box">
                  <DriTechnologyForm key={technology} technology={technology} permission={driTechnologyPermissions[technology]} driTechnologies={driTechnologies} />
                </Col>
              </Row>
              <Row>
                <Col className="box">
                  <DriFeatureForm key={technology} technology={technology} permission={driTechnologyPermissions[technology]} />
                </Col>
              </Row>
            </>
          )}
        </div>
      ) : (
        <ErrorComponent />

      )}
    </>
  )
}

export default React.memo(DriPage)
