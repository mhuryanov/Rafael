import React, { useEffect, useState } from 'react'
import { useFetchRafael } from '../../../hooks/fetchData'
import { TECHNOLOGY_INFO_API, KPI_MAPPING_API } from '../../../utilities/constants'

export const FeatureContext = React.createContext()
export const SetFeatureContext = React.createContext()

export const FeatureProvider = ({ technology, feature, children }) => {
  const [state, setState] = useState({
    segmentMapping: {},
    kpis: [],
    metaMapping: {},
    metaKeys: [],
  })
  const [isLoadingSegmentMapping, segmentMapping] = useFetchRafael({ url: `${TECHNOLOGY_INFO_API}${technology}/${feature}/info` }, [])
  const [isLoadingKpis, kpis] = useFetchRafael({ url: `${KPI_MAPPING_API}${technology}/${feature}` }, [])
  const isLoading = isLoadingSegmentMapping || isLoadingKpis
  const isError = segmentMapping.errorMessage

  useEffect(() => {
    if (!isLoading && !isError) {
      const { segment_mapping: newSegmentMapping } = segmentMapping
      const newKpis = kpis
      setState(prevState => ({
        ...prevState,
        segmentMapping: newSegmentMapping,
        kpis: newKpis
      }))
    }
  }, [isLoading, isError, segmentMapping, kpis])

  return (
    <FeatureContext.Provider value={state}>
      <SetFeatureContext.Provider value={setState}>
        {children}
      </SetFeatureContext.Provider>
    </FeatureContext.Provider>
  )
}
