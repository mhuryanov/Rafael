import React from 'react'
import { Link } from 'react-router-dom'

const FieldTestLink = ({ name, technology, feature, fieldTestId }) => {
  const url = `/technology/${technology}/${feature}/report/${fieldTestId}`

  return (
    <Link to={url} >
      {name}
    </Link>
  )
}

export default React.memo(FieldTestLink)
