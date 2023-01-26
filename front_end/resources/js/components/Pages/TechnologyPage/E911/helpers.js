export const idxToPercent = (idx, length) => {
  if (length === 0) return undefined
  return ((idx + 1) / length * 100)
}

// binary search to return index of the closest value to the target.
export const searchClosestIdx = (sortedArray, start, end, target) => {
  const mid = start + Math.floor((end - start) / 2)
  if (start >= end) {
    if (sortedArray[start] < target) {
      return start
    }
    if (sortedArray[start - 1] < target) {
      return start - 1
    }
    return -1
  }
  if (target <= sortedArray[mid]) {
    return searchClosestIdx(sortedArray, start, mid, target)
  }
  return searchClosestIdx(sortedArray, mid + 1, end, target)
}

// linear interpolation to get CDF percentiles from 0-100. I used the same algorithm as pandas.quantile()
// i + (j - i) * fraction, where fraction is the fractional part of the index
// results validated against pandas
export const getCdfPercentiles = (sortedArray) => {
  if (sortedArray.length === 0) return sortedArray
  if (sortedArray.length === 1) {
    return _.range(101).map(() => sortedArray[0])
  }
  const cdfPercentiles = _.range(101).map((percentile) => {
    const percentileFraction = percentile / 100
    const index = Math.floor((percentileFraction) * (sortedArray.length - 1))
    const indexFraction = 1 / (sortedArray.length - 1)
    if (index * indexFraction === percentileFraction) return sortedArray[index]
    const fractionalDifference = (percentileFraction - (index * indexFraction)) / (indexFraction)
    const value = sortedArray[index] + (sortedArray[index + 1] - sortedArray[index]) * (fractionalDifference)
    return value
  })
  return cdfPercentiles
}
