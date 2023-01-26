/* eslint-disable import/no-mutable-exports */
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import apiMiddleware from './middleware/api'
import rootReducer from './reducers'

const initState = {}
const middleware = [thunk, apiMiddleware]
if (window.navigator.userAgent.includes('Chrome')) {
  var store = createStore(
    rootReducer,
    initState,
    compose(
      applyMiddleware(...middleware),
      window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    )
  )
} else {
  var store = store = createStore(
    rootReducer,
    applyMiddleware(...middleware)
  )
}
export default store
