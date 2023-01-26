import React from 'react'
import ReactDOM from 'react-dom'
import Master from './App'

const bodyContainer = document.querySelector('#body_container')
const e = React.createElement
ReactDOM.render(e(Master), bodyContainer)