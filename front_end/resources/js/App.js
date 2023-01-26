'use strict';
import React from 'react';
import { Suspense, lazy } from 'react';
import { Container } from 'react-bootstrap'
import {
  BrowserRouter as Router
} from 'react-router-dom'
import { ThemeProvider } from 'styled-components';
import theme from '@tidbits/react-tidbits/theme';
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import { StateProvider } from './components/StateContext'
import Routes from './Routes'

const MainNavBar = lazy(() => import('./components/Nav/MainNavBar'))
const PageNav = lazy(() => import('./components/Nav/PageNav'))
const ReactNotification = lazy(() => import('react-notifications-component'))

import 'react-notifications-component/dist/theme.css'
import '../style/main.css';
import '../style/contextmenu.less';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/react-contextmenu.css'
const shortid = require('shortid')

const Master = () => {
  console.log('Rendering Master')
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <StateProvider>
          <Suspense fallback={<Spinner visible />}>
            <ReactNotification />
          </Suspense>
          <Suspense fallback={<Spinner visible />}>
            <MainNavBar key={shortid.generate()} />
          </Suspense>
          <Suspense fallback={<Spinner visible />}>
            <Container className="app-container" fluid>
              <PageNav />
              <Routes />
            </Container>
          </Suspense>
        </StateProvider>
      </ThemeProvider>
    </Router>

  );
}

export default Master
