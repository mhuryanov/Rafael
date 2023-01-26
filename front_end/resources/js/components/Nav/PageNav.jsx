/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React from 'react'
import {
  Link,
  Route,
  Switch,
  useLocation,
  Redirect
} from 'react-router-dom'

import { getTechnologyFromPath } from '../../utilities/helpers'

const PageNav = () => {
  const location = useLocation()
  const { pathname } = location
  const currentTechnology = getTechnologyFromPath(pathname)

  const technologyPath = `/technology/${currentTechnology}`
  const searchPath = `/search`
  const statusPath = `/status`
  const settingsPath = `/settings`
  const errorPath = `/error`
  const taggingPath = `/tagging`
  
  return (
    <div className="page-nav">
      <i className="arrow right" />
      <Switch>
        <Route exact path="/">
          <Link to="/" className="page-nav-label">Location Technologies</Link>
        </Route>
        <Route path={technologyPath}>
          <Link to={technologyPath} className="page-nav-label">
            {`${currentTechnology === 'R1' ? 'PROXIMITY' : currentTechnology}`}
          </Link>
        </Route>
        <Route path={searchPath}>
          <Link to={searchPath} className="page-nav-label">Advanced Search</Link>
        </Route>
        <Route path={statusPath}>
          <Link to={statusPath} className="page-nav-label">Pipeline Status</Link>
        </Route>
        <Route path={settingsPath}>
          <Link to={settingsPath} className="page-nav-label">Settings</Link>
        </Route>
        <Route path={taggingPath}>
          <Link to={taggingPath} className="page-nav-label">Tag Rules</Link>
        </Route>
        <Route path={errorPath}>
          <Link to={errorPath} className="page-nav-label">404</Link>
        </Route>
      </Switch>
    </div>
  )
}

export default React.memo(PageNav)