import axios from 'axios'
import { API_CALL } from '../actions/types'
import {
  accessDenied, apiError, apiStart, apiEnd,
} from '../actions/api';
import { getLocalStorage } from '../utilities/helpers'
const apiMiddleware = ({ dispatch }) => next => (action) => {
  if (action.type === API_CALL) {
    const {
      url,
      method,
      data,
      accessToken,
      onBeginning,
      onSuccess,
      onFailure,
      label,
      headers
    } = action.payload
    const dataOrParams = ['GET', 'DELETE'].includes(method) ? 'params' : 'data'
    // eslint-disable-next-line no-undef
    const { rafaeltoken, admin_rafaeltoken } = getLocalStorage("LOGIN_AS") ? getLocalStorage("LOGIN_AS") : userInfo;
    // axios default configs
    axios.defaults.baseURL = process.env.REACT_APP_BASE_URL || ''
    axios.defaults.headers.common['Content-Type'] = 'application/json'
    axios.defaults.headers.common.rafaeltoken = admin_rafaeltoken ? admin_rafaeltoken : rafaeltoken
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`
    axios.defaults.xsrfCookieName = 'csrftoken'
    axios.defaults.xsrfHeaderName = 'X-CSRFToken'
    axios.defaults.responseType = 'json'
    if (label) {
      dispatch(apiStart(label))
    }
    dispatch(onBeginning())
    axios
      .request({
        url,
        method,
        headers,
        [dataOrParams]: data
      })
      .then(({ data }) => {
        dispatch(onSuccess(data))
      })
      .catch((error) => {
        dispatch(apiError(error))
        dispatch(onFailure(error))

        if (error.response && error.response.status === 403) {
          dispatch(accessDenied(window.location.pathname))
        }
      })
      .finally(() => {
        if (label) {
          dispatch(apiEnd(label))
        }
      })
  }
  return next(action)
}

export default apiMiddleware
