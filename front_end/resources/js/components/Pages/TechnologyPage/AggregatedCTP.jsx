/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { StatePanel } from '@dx/continuum-state-panel'

import { ARCHIVE_REPORTING_LOGS, CTP } from '../../../utilities/constants'
import { isEmpty, setDefaultObject } from '../../../utilities/helpers'
import { useFetchArchiveData } from '../../../hooks/fetchData'

const StackedBarChart = lazy(() => import('../../Plots/StackedBarChart'))

const _ = require('underscore')
const shortid = require('shortid')

const SUCCESS_VERDICTS = [3, 4] // 3:PWIS, 4:PASS are treat as pass
                                // 2:Fail, 6:No Log are considered as fail
                                // 0:Blocked 1:Unknown 5:Observation are not used in CTP

const AggregatedCTP = ({
  technology,
  feature,
  dateState,
  archives
}) => {
  const archiveIds = archives.map(archive => archive.id)
  const logName = `r_${technology.toLowerCase()}_${feature.toLowerCase()}_ctp_summary`
  const [isLoading, archivesInfo] = useFetchArchiveData(archiveIds, ARCHIVE_REPORTING_LOGS, logName)
  const [dataByTime, setDataByTime] = useState({})
  const { errorMessage } = archivesInfo

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const newDataByTime = {}
      Object.entries(archivesInfo).map(([archiveId, archiveData]) => {
        if (!isEmpty(archiveData)) {
          const matchingArchive = _.find(archives, archive => archive.id === archiveId)
          const { test_date } = matchingArchive
          const { tc_name: tcNames, tstt: tstts, verdict: verdicts, group: groups } = archiveData
          tcNames.forEach((tcName, i) => {
            const tstt = tstts[i]
            const verdict = verdicts[i]
            const group = groups[i]
            let pass = false
            if (SUCCESS_VERDICTS.includes(verdict)) {
              pass = true
            }
            const newData = {
              group,
              tcName,
              tstt,
              pass,
              timestamp: test_date,
              numPassing: pass ? 1 : 0,
              total: 1
            }
            if (tcName in newDataByTime) {
              const match = _.find(newDataByTime[tcName], data => data.timestamp === test_date)
              if (match) {
                match.pass = pass && match.pass
                if (pass) match.numPassing += 1
                match.total += 1
              } else {
                newDataByTime[tcName].push(newData)
              }
            } else {
              newDataByTime[tcName] = [newData]
            }
          })
        }
      })
      setDataByTime(newDataByTime)
    }
  }, [isLoading, archivesInfo])

  const allData = !isEmpty(dataByTime) ? Object.values(dataByTime).flat() : []

  console.log('Rendering AggregatedCTP')
  return (
    <>
      {allData.length === 0 ? (
        <div style={{ marginTop: '100px' }}>
          <StatePanel message="No CTP results found." />
        </div>
      ) : (
        <Suspense fallback={<Spinner visible />}>
          <StackedBarChart allData={allData} dateState={{ ...dateState, dateGroup: { label: 'Day', value: 1 } }} errorType={CTP} width={800} />
        </Suspense>
      )}
      <Spinner visible={isLoading} />
    </>
  )
}

export default React.memo(AggregatedCTP)
