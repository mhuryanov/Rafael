import React, { useContext, useState } from 'react'
import { Text, Icons } from '@tidbits/react-tidbits'
import { Button } from '@dx/continuum-button'

import { StateContext, SetStateContext } from '../StateContext'
import { AddNotification, useCurrentUrl, getTechnologyFromPath, getFavoriteByUrl, updateFavorites } from '../../utilities/helpers'


const FavoriteIcon = () => {
  const currentUrl = useCurrentUrl()
  const technology = getTechnologyFromPath(currentUrl)
  const { userPreferences } = useContext(StateContext)
  const setContextState = useContext(SetStateContext)
  const { favorites } = userPreferences
  const favoriteNames = favorites.filter(favorite => favorite.technology === technology).map(favorite => favorite.name)
  const { name: favoriteName = '' } = getFavoriteByUrl(favorites, currentUrl)

  const handleSuccess = (name) => {
    setContextState(prevState => ({
      ...prevState,
      userPreferences
    }))
    AddNotification(`Saved ${name} to user favorites.`, 'success')
  }

  const handleFavorite = () => {
    const name = prompt('Please enter a name for the dashboard', favoriteName)
    if (favoriteName === name) return
    if (name.length === 0) {
      alert('Name cannot be empty')
      return
    }
    if (name.length > 50) {
      alert('Name cannot be greater than 50 characters')
      return
    }
    if (favoriteNames.includes(name)) {
      alert('Name already taken')
      return
    }
    const newFavorite = {
      url: currentUrl,
      name,
      technology,
      date: (new Date()).toISOString()
    }
    updateFavorites(favorites, newFavorite)
    userPreferences.save(() => handleSuccess(name), null)
  }

  console.log('Rendering FavoriteIcon')
  return (
    <Button variant="default" onClick={handleFavorite}>
      Save As
    </Button>
  )
}

export default React.memo(FavoriteIcon)
