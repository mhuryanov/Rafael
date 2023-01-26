import React, { Suspense, lazy } from 'react';

import {
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import ErrorBoundary from './components/ErrorBoundary'

const HomePage = lazy(() => import('./components/Pages/HomePage/HomePage'))
const SearchPage = lazy(() => import('./components/Pages/SearchPage/SearchPage'))
const StatusPage = lazy(() => import('./components/Pages/StatusPage/StatusPage'))
const SettingsPage = lazy(() => import('./components/Pages/SettingsPage/SettingsPage'))
const TechnologyPage = lazy(() => import('./components/Pages/TechnologyPage/TechnologyPage'))
const TagsPage = lazy(() => import('./components/Pages/TagsPage'))
const ErrorPage = lazy(() => import('./components/Pages/ErrorPage'))

const Routes = () => {

  return (
    <Switch>
      <Route exact path="/" render={() => (
        <Suspense fallback={<Spinner visible={true} />}>
          <HomePage />
        </Suspense>
      )} />
      <Route path="/search" render={() => (
        <ErrorBoundary>
          <Suspense fallback={<Spinner visible={true} />}>
            <SearchPage />
          </Suspense>
        </ErrorBoundary>
      )} />
      <Route exact path="/status" render={() => (
        <ErrorBoundary>
          <Suspense fallback={<Spinner visible={true} />}>
            <StatusPage />
          </Suspense>
        </ErrorBoundary>
      )} />
      <Route path="/settings" render={() => (
        <ErrorBoundary>
          <Suspense fallback={<Spinner visible={true} />}>
            <SettingsPage />
          </Suspense>
        </ErrorBoundary>
      )} />
      <Route path="/tagging" render={() => (
        <ErrorBoundary>
          <Suspense fallback={<Spinner visible={true} />}>
            <TagsPage />
          </Suspense>
        </ErrorBoundary>
      )} />
      <Route path={`/technology/:technology`}>
        <ErrorBoundary>
          <Suspense fallback={<Spinner visible={true} />}>
            <TechnologyPage />
          </Suspense>
        </ErrorBoundary>
      </Route>
      <Route exact path="/error" render={() => (
        <Suspense fallback={<Spinner visible={true} />}>
          <ErrorPage />
        </Suspense>
      )} />
      <Route render={() => (
        <Redirect to="/error" />
      )} />
    </Switch>
  )
}

export default Routes
