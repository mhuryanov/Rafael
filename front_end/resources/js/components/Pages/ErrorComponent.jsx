import React from 'react'
import { StatePanel } from '@dx/continuum-state-panel'

const ErrorComponent = () => (
  <StatePanel
    message="You do not have access to view this page"
    suggestion={(
      <a href="https://a1391192.slack.com/archives/CQK986RFH"><h3>Slack: #keylime-pie-help</h3></a>
    )}
  />
)


export default React.memo(ErrorComponent)
