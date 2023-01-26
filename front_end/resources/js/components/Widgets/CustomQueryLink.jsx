import React from 'react'
import { Link } from 'react-router-dom'

const _ = require('underscore')

const CustomQueryLink = ({ name, technology, feature, params }) => {
  const baseUrl = `/technology/${technology}/${feature}/report/q?`
  let queryUrl = ''
  _.each(params, (value, queryParam) => {
    queryUrl += queryUrl ? `&${queryParam}=${value}` : `${queryParam}=${value}`
  })

  return (
    <Link to={baseUrl + queryUrl}>
      {name}
    </Link>
  )
}

export default React.memo(CustomQueryLink)
