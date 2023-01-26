import { setDefaultObject, isEmpty } from '../../../utilities/helpers'
import { BOUNDS } from '../../Pages/TechnologyPage/Awd/constants'
const _ = require('underscore')

export const getBins = (categories) => {
  switch (true) {
    case categories.includes('achieved_accuracy'):
      return BOUNDS.accuracy
    case categories.includes('achieved_vertical_accuracy'):
      return BOUNDS.vacc
    case categories.includes('ttff'):
      return BOUNDS.ttff
    default:
      return []
  }
}

export const getBinnedData = (data, bins) => {
  const binnedData = {}
  let maxBin = -1
  Object.entries(data).forEach(([category, subCategories]) => {
    if (maxBin < Number(category) + 1) {
      maxBin = Number(category) + 1
    }
  })
  Object.entries(data).forEach(([category, subCategories]) => {
    const index = Number(category) > bins.length ? -1: Number(category) + 1 //_.findIndex(bins, val => val > Number(category))
    if (index < 0){
      return
    }
    const label = `[${bins[index - 1]}-${bins[index]}]`
    const labels = _.range(1, maxBin + 1).map(i => `[${bins[i - 1]}-${bins[i]}]`)
    setDefaultObject(binnedData, label)
    labels.forEach((l) => {
      Object.entries(subCategories).sort((a, b) => a[0] > b[0] ? 1 : -1).forEach(([subCategory, value]) => {
        if (!(Object.keys(subCategories).length > 1 && subCategory === 'Total Count')) {
          if (!(l in binnedData)) {
            setDefaultObject(binnedData, l)
            binnedData[l][subCategory] = 0
          } else if (l === label) {
            if (subCategory in binnedData[label]) binnedData[label][subCategory] += value
            else binnedData[label][subCategory] = value
          }
        }
      })
    })
  })
  return binnedData
}

export const getPlotData = (data, categories) => {
  const formattedData = []
  let processedData
  const totalCounts = {}
  const bins = getBins(categories)
  if (!isEmpty(bins)) {
    processedData = getBinnedData(data, bins)
  } else {
    processedData = data
  }
  Object.entries(processedData).forEach(([category, subCategories]) => {
    const dataEntry = { category }
    const totalSum = subCategories['Total Count']
    Object.entries(subCategories).forEach(([subCategory, value]) => {
      if (!(Object.keys(subCategories).length > 1 && subCategory === 'Total Count')) {
        dataEntry[subCategory] = value
        dataEntry[`${subCategory}-HDF`] = totalSum ? Number(value / totalSum * 100).toFixed(2) : value
        if (subCategory in totalCounts) totalCounts[subCategory] += value
        else totalCounts[subCategory] = value
      }
    })
    formattedData.push(dataEntry)
  })
  if (categories.includes('dates') || categories.includes('day')) {
    formattedData.sort((a, b) => (a.category > b.category) ? 1 : -1)
  }
  if (!isEmpty(bins)) {
    formattedData.sort((a, b) => Number(a.category.slice(1, a.category.lastIndexOf('-'))) > Number(b.category.slice(1, b.category.lastIndexOf('-'))) ? 1 : -1)
  }
  const runningCounts = {}
  const dataToPlot = []
  formattedData.forEach((dataEntry) => {
    const newDataEntry = JSON.parse(JSON.stringify(dataEntry))
    Object.keys(dataEntry).filter(key => (key !== 'category' && !key.includes('-HDF'))).forEach((key) => {
      const value = dataEntry[key]
      if (key in runningCounts) runningCounts[key] += value
      else runningCounts[key] = value
      newDataEntry[`${key}-CDF`] = Math.round(runningCounts[key] / totalCounts[key] * 100)
    })
    dataToPlot.push(newDataEntry)
  })
  return dataToPlot
}
