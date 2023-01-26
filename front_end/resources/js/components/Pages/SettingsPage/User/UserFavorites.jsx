import React, { useEffect, useState, useContext } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import {
  Link,
  Redirect
} from 'react-router-dom'
import { DataGrid, DataGridRow, DataGridColumn } from '@dx/continuum-data-grid'
import { Button } from '@dx/continuum-button'

import { StateContext, SetStateContext } from '../../../StateContext'

const columns = [
  'Name',
  'Technology',
  'Date Added',
  ' '
]

const UserFavorites = () => {
  const { userPreferences } = useContext(StateContext)
  const setContextState = useContext(SetStateContext)
  const { favorites } = userPreferences

  const handleSuccess = () => {
    setContextState(prevState => ({
      ...prevState,
      userPreferences
    }))
  }

  const handleDelete = (url) => {
    const favoriteUrls = favorites.map(favorite => favorite.url)
    const idx = favoriteUrls.indexOf(url)
    favorites.splice(idx, 1)
    userPreferences.save(handleSuccess, null)
  }

  const data = favorites.map(favorite => ({
    Name: <Link to={favorite.url}>{favorite.name}</Link>,
    'Technology': favorite.technology,
    'Date Added': favorite.date,
    ' ': <Button size="small" variant="danger" onClick={() => handleDelete(favorite.url)}>Delete</Button>
  }))

  console.log('Rendering UserFavorites')
  return (
    <div className="settings-container">
      <h3 className="plot-title">Favorited Dashboards</h3>
      <div className="form-container">
        <DataGrid
          data={data}
          pageSize={10}
        >
          <DataGridRow>
            {columns.map(column => (
              <DataGridColumn key={column} field={column} />
            ))}
          </DataGridRow>
        </DataGrid>
      </div>
    </div>
  )
}

export default React.memo(UserFavorites)
