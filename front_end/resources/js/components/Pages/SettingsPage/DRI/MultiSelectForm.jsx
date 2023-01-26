import React, { useEffect, useState } from 'react'
import { Suspense, lazy } from 'react'
import { Text } from '@tidbits/react-tidbits'
import { Spinner, InlineSpinner } from '@tidbits/react-tidbits/Spinner'

import { formatItems } from './helpers'

const CreatableSelect = lazy(() => import('react-select/creatable'))

const initialState = {
  itemOptions: [],
  allItemOptions: []
}

const MultiSelectForm = ({ type, items, allItems, selectCallBack, title }) => {
  const typeKey = type.toUpperCase()
  const [formState, setFormState] = useState(initialState)
  const [isLoadingChange, setIsLoadingChange] = useState(false)
  const [error, setError] = useState('')
  const { itemOptions, allItemOptions } = formState

  useEffect(() => {
    const newItems = formatItems(items, typeKey)
    const newAllItems = formatItems(allItems, typeKey)
    const newAllItemOptions = newAllItems
      .map(item => ({
        value: item,
        label: item
      }))
    const newItemOptions = newItems
      .map(item => ({ label: item, value: item }))
    setFormState({
      itemOptions: newItemOptions,
      allItemOptions: newAllItemOptions
    })
  }, [items, allItems])

  const handleSuccess = (newItems) => {
    const newItemOptions = newItems
      .map(item => ({ label: item, value: item }))
    setFormState(prevState => ({
      ...prevState,
      itemOptions: newItemOptions
    }))
    setIsLoadingChange(false)
  }

  const handleError = (errorMessage) => {
    setIsLoadingChange(false)
    setError(errorMessage)
  }

  const handleItemSelect = (options) => {
    setError('')
    setIsLoadingChange(true)
    const newItems = Array.isArray(options) ? options.map(option => option.value) : []
    selectCallBack(type, newItems, () => handleSuccess(newItems), handleError)
  }

  console.log('Rendering MultiSelectForm')
  return (
    <div className="multi-select-body">
      <Suspense fallback={<Spinner visible />}>
        <Text textStyle="h4Reg" mb="0px">{title}</Text>
        <CreatableSelect
          backspaceRemovesValue={false}
          isDisabled={isLoadingChange}
          isClearable={false}
          isMulti
          value={itemOptions}
          placeholder={`Add ${type[0].toUpperCase() + type.slice(1)}...`}
          onChange={handleItemSelect}
          options={allItemOptions}
        />
      </Suspense>
      <div className="form-message-text">
        {isLoadingChange && <Text>Loading <InlineSpinner visible={true} /></Text>}
        {error !== '' && (
          <div className="sub-error-text">
            {`Something went wrong: ${error}`}
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(MultiSelectForm)
