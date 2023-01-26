import React from 'react'
import { Redirect } from 'react-router-dom'
import { sendToServer, getUserInfo } from '../utilities/helpers'
import { ERROR_API } from '../utilities/constants'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: false }
  }

  static getDerivedStateFromError(error) {
    console.log(error)
    return { error: true }
  }

  componentDidCatch(error, errorInfo) {
    const url = ERROR_API
    const { email: user_email } = getUserInfo()
    const data = {
      error_info: {
        user: user_email,
        message: error.message,
        trace: error.stack.split('\n')
      },
      stack_trace: errorInfo.componentStack.split('\n').map(entry => entry.trim())
    }
    sendToServer(url, data, 'POST', () => console.log(error, errorInfo))
  }

  render() {
    const { error } = this.state
    if (error) {
      return <Redirect to="/error" />
    }

    return this.props.children
  }
}
