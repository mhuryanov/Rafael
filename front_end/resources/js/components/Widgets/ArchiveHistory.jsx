import React, { useEffect, useState } from 'react'
import { Popover, Icons, Text } from '@tidbits/react-tidbits'
import { InlineSpinner } from '@tidbits/react-tidbits/Spinner'

import { useFetchRafael } from '../../hooks/fetchData'
import { ARCHIVE_API } from '../../utilities/constants'

const ArchiveHistory = ({ archiveId }) => {
  const [isLoading, archiveHistory] = useFetchRafael({ url: `${ARCHIVE_API}${archiveId}/history` }, [])
  const [lastUpdatedDate, setLastUpdatedDate] = useState(null)

  useEffect(() => {
    if (!isLoading && !archiveHistory.message) {
      if (archiveHistory.length > 0) {
        let newLastUpdatedDate = archiveHistory[0].updated_at
        newLastUpdatedDate = newLastUpdatedDate.split(' ').slice(1).join(' ')
        setLastUpdatedDate(newLastUpdatedDate)
      }
    }
  }, [isLoading, archiveHistory])

  return (
    <Text>
      {lastUpdatedDate || 'N/A'}
      <InlineSpinner visible={isLoading} />
    </Text>
  )
}

export default React.memo(ArchiveHistory)
