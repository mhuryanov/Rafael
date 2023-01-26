/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { Suspense, lazy } from 'react'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

const GnssSummary = lazy(() => import('./Gnss/GnssSummary'))
const GnssCustomSummary = lazy(() => import('./Gnss/GnssCustomSummary'))
const ClxGFSummary = lazy(() => import('./Clx/ClxGFSummary'))
const ClxGeneralSummary = lazy(() => import('./Clx/ClxGeneralSummary'))
const TTFFSummary = lazy(() => import('./Gnss/TTFFSummary')) 
const FindMySummary = lazy(() => import('./R1/FindMySummary'))
const ORSummary = lazy(() => import('./R1/ORSummary'))
const E911Summary = lazy(() => import('./E911/E911Summary'))
const RoutineSummary = lazy(() => import('./Routine/RoutineSummary'))
const LklSummary = lazy(() => import('./BlueAvengers/LklSummary'))
const OfflineFindingSummary = lazy(() => import('./BlueAvengers/OfflineFindingSummary'))
const ReplayNearbydSummary = lazy(() => import('./Replay/ReplayNearbydSummary'))


const TechnologySummary = ({ technology, feature, archives, options = {} }) => {
  const { fieldTestIds, segment, allArchives } = options
  switch (true) {
    case technology === 'GNSS' && fieldTestIds !== undefined:
      return (
        <Suspense fallback={<Spinner visible />}>
          <GnssCustomSummary
            feature={feature}
            archives={archives}
            fieldTestIds={fieldTestIds}
          />
        </Suspense>
      )
    case technology === 'GNSS' && feature === 'TTFF':
      return (
        <Suspense fallback={<Spinner visible />}>
          <TTFFSummary
            archives={archives}
            segment={segment}
          />
        </Suspense>
      )
    case technology === 'GNSS':
      return (
      <Suspense fallback={<Spinner visible />}>
        <GnssSummary
          feature={feature}
          archives={archives}
          segment={segment}
        />
      </Suspense>
      )
    case technology === 'CLX' && feature === 'GEOFENCING':
      return (
      <Suspense fallback={<Spinner visible />}>
        <ClxGFSummary
          feature={feature}
          archives={archives}
        />
      </Suspense>
      )
    case technology === 'CLX' && (feature === 'SEPARATIONALERTS' || feature === 'MICROLOCATIONS'):
      return (
      <Suspense fallback={<Spinner visible />}>
        <ClxGeneralSummary
          feature={feature}
          archives={archives}
        />
      </Suspense>
      )
    case technology === 'R1' && ['FINDMY', 'FINDBTRSSI'].includes(feature):
      return (
      <Suspense fallback={<Spinner visible />}>
        <FindMySummary
          feature={feature}
          archives={archives}
        />
      </Suspense>
      )
    case technology === 'R1' && feature === 'OR':
      return (
      <Suspense fallback={<Spinner visible />}>
        <ORSummary
          archives={allArchives}
        />
      </Suspense>
      )
    case technology === 'E911':
      return (
        <Suspense fallback={<Spinner visible />}>
          <E911Summary
            feature={feature}
            archives={archives}
          />
        </Suspense>
      )
    case technology === 'ROUTINE':
      return (
        <Suspense fallback={<Spinner visible />}>
          <RoutineSummary
            feature={feature}
            archives={archives}
          />
        </Suspense>
      )
    case technology === 'BA' && feature === 'LKL':
      return (
        <Suspense fallback={<Spinner visible />}>
          <LklSummary
            archives={archives}
          />
      </Suspense>
      ) 
    case technology === 'BA' && feature === 'OFFLINEFINDING':
      return (
        <Suspense fallback={<Spinner visible />}>
          <OfflineFindingSummary
            feature={feature}
            archives={archives}
          />
      </Suspense>
      ) 
    case technology === 'REPLAY' && ['NEARBYD'].includes(feature):
      return (
        <Suspense fallback={<Spinner visible />}>
          <ReplayNearbydSummary
            feature={feature}
            archives={archives}
          />
      </Suspense>
      ) 
    default:
      return null
  }
}

export default React.memo(TechnologySummary)
