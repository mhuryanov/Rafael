import React, { useState } from 'react'
import { Icons } from '@tidbits/react-tidbits'
import { useEffect } from 'react'

const SideNav = ({ elementId, children, contentKey }) => {
  const [collapsed, setCollapsed] = useState()

  useEffect(() => { // re-display sidenav on content change
    setCollapsed(false)
  }, [contentKey])

  useEffect(() => {
    if (!collapsed) {
      document.getElementById(elementId).style.width = '400px'
    } else {
      document.getElementById(elementId).style.width = '35px'
    }
  }, [collapsed])

  const handleCollapse = () => {
    setCollapsed(prevCollaspsed => !prevCollaspsed)
  }

  return (
    <div id={elementId} className="sidenav">
      {collapsed ? (
        <Icons.LeftIcon width="15px" height="15px" cursor="pointer" color="info" onClick={handleCollapse} />
      ) : (
        <Icons.RightIcon width="15px" height="15px" cursor="pointer" color="info" onClick={handleCollapse}/>
      )}
      <div style={{ marginTop: '35px', visibility: collapsed ? 'hidden' : '' }}>{children}</div>
    </div>
  )
}

export default React.memo(SideNav)
