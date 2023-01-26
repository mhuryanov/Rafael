/* eslint-disable no-restricted-globals */
/* eslint-disable no-alert */
/* eslint-disable no-console */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-undef */
import React, { useContext } from 'react'
import {
  Link
} from 'react-router-dom'
import { Nav, Navbar, NavDropdown } from 'react-bootstrap'
import LogoImg from '../../imgs/apple.png'
import {
  AddNotification, StringToClipboard, isUserAdmin, getTechnologiesToShow, sendToServer,
  getLocalStorage
} from '../../utilities/helpers'
import { StateContext } from '../StateContext'
import { USER_API } from '../../utilities/constants'
import { getUserInfo } from '../../utilities/helpers'

const _ = require('underscore')
const shortid = require('shortid')

const ROUTE_MAPPING = {
  search: '🔎 Advanced Search',
  status: '🪧 Pipeline Status',
  settings: '⚙️ Settings',
  tagging: '🏷️ Tag Rules'

}

function onProfileSelect(current) {
  const login_as = getUserInfo()
  switch (current) {
    case 'login_as': {
      const loginAsEmail = prompt('Please enter the user Email you are trying login as.')
      if (loginAsEmail) {
        // Verifying the Token
        sendToServer(`${USER_API}${loginAsEmail}/user_info/`, {}, 'GET', (response) => {
          localStorage.setItem('LOGIN_AS', JSON.stringify(response))
          AddNotification(`You just login as ${response.first_name} ${response.last_name}.`, 'success')
          location.reload()
        }, () => {
          AddNotification('Bad email... ', 'danger')
        })
      }
      break
    }
    case 'become_yourself':
      {
        localStorage.removeItem('LOGIN_AS')
        location.reload()
        break
      }
    case 'CLI':
      {
        window.location = 'https://pages.github.pie.apple.com/keylime/keylime/'
        break
      }
    case 'userToken':
      {
        StringToClipboard(login_as.rafaeltoken)
        AddNotification('User Keylime Token will not expire.', 'success')
        break
      }
    case 'temporary_admin_rafaeltoken':
      {
        sendToServer(`${USER_API}${login_as.temporary_admin_rafaeltoken}`, {}, 'GET', (response) => {
          window.prompt('Copy to clipboard: Cmd+C, Enter', response.temporary_admin_rafaeltoken)
          AddNotification('Admin Keylime Token will expire soon.', 'success')
        })
        break
      }
    default:
      { return null }
  }
  return null
}
const ProfileDropDown = () => {
  const login_as = getUserInfo()
  return (
    <NavDropdown
      alignRight
      title={`👤${login_as.first_name} ${login_as.last_name}`}
      id="nav-dropdown"
      onSelect={onProfileSelect}
    >
      <NavDropdown.Item eventKey="CLI"><span role="img" aria-label="tool">🛠️ Python Library Doc </span></NavDropdown.Item>
      <NavDropdown.Item eventKey="userToken">
        <span role="img" aria-label="user token">🔑 User KeyLime Token</span>
      </NavDropdown.Item>
      {isUserAdmin() && (
        <>
          <NavDropdown.Item eventKey="temporary_admin_rafaeltoken">
            <span role="img" aria-label="admin token"> 👑 Admin Temporary Token</span>
          </NavDropdown.Item>
          <NavDropdown.Item eventKey="login_as">
            <span role="img" aria-label="login as"> 👺 Log in as</span>
          </NavDropdown.Item>
        </>
      )}
      {
        getLocalStorage('LOGIN_AS')
        && (
          <NavDropdown.Item eventKey="become_yourself">
            <span role="img" aria-label="become yourself"> 🤓 MySelf</span>
          </NavDropdown.Item>
        )
      }
      <NavDropdown.Divider />
      <NavDropdown.Item eventKey="Radar">Radar</NavDropdown.Item>
      <NavDropdown.Item >Backend Version: {klpBackEndVersion}</NavDropdown.Item>
    </NavDropdown>
  )
}

const GetDisplayName = (technology) => {
  switch (technology) {
    case 'R1':
      return 'PROXIMITY'
    default:
      return technology
  }
}

const MainNavBar = () => {
  const { userPreferences } = useContext(StateContext)
  // const timeInSeconds = useContext(TimeContext)
  const { technologyPreferences } = userPreferences
  const allTechnologies = getTechnologiesToShow(technologyPreferences)

  console.log('Rendering MainNavBar')
  return (
    <Navbar className="main-nav-bar">
      <Navbar.Brand>
        <Link to="/" className="nav-home-link keylime">
          <img src={LogoImg} alt="logo" style={{ marginRight: '10%', height: '30px', paddingBottom: '8px' }} />
          <span>Key Lime Pie</span>
        </Link>
      </Navbar.Brand>
      <Nav className="mr-auto" style={{overflowX: "auto"}}>
      {_.map(allTechnologies, technology => (
          <Link to={`/technology/${technology}`} className="technology-nav" key={shortid.generate()}>
            {GetDisplayName(technology)}
          </Link>
      ))}
        </Nav>
      <Nav className="ml-auto">
        <NavDropdown
          alignRight
          title={(
            <span>
              <div className="hamburger-icon" />
              <div className="hamburger-icon" />
              <div className="hamburger-icon" />
            </span>
          )}
          className="no-caret"
          style={{ zIndex: 99 }}
        >
          {Object.entries(ROUTE_MAPPING).map(([route, label], i) => (
            <div key={shortid.generate()}>
              {i !== 0 && <NavDropdown.Divider />}
              <NavDropdown.Item
                as={Link}
                to={`/${route}`}
                key={route}
              >
                {label}
              </NavDropdown.Item>
            </div>
          ))}
        </NavDropdown>
        <ProfileDropDown />
      </Nav>
    </Navbar>
  )
}

export default React.memo(MainNavBar)