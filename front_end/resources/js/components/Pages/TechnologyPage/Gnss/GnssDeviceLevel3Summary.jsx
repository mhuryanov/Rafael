/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Text } from '@tidbits/react-tidbits'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import HelpTooltip from '../../../Widgets/HelpTooltip'
import { useFetchArchiveData } from '../../../../hooks/fetchData'
import { ARCHIVE_REPORTING_LOGS, KPI_TABLE, L5} from '../../../../utilities/constants'
import { getIndices, setDefaultObject, isEmpty, downloadStorageWithExtension, sendToServer} from '../../../../utilities/helpers'
import Box from '../../../Box'
import { Button } from '@dx/continuum-button'
import Constants from './constants'

const SummaryTable = lazy(() => import('../../../Tables/SummaryTable'))
const TimeSeries = lazy(() => import('../../../Plots/TimeSeries'))

const technology = "GNSS"

const GnssDeviceLevel3Summary = ({
  feature,
  archive,
  table_name='',
  label
}) => {
  const [filters, setFilters] = useState({
    archiveIds: [archive.id],
    devices: [archive.model_hardware],
    buildTrains: [archive.build_train]
  })
  const SimCloudDownload = ({ fileName, archive_id }) => {
    const [redirect, setRedirect] = useState(null)
    const handleClick = () => downloadStorageWithExtension(archive_id, fileName)

    return (
      <>
        <Button onClick={handleClick}>Download</Button>
        {redirect}
      </>
    )
  }
  
  console.log('Rendering GnssL5')
  return (
    <>
      <Row>
        <Col className="box devicel3-table">
          <h1 className="plot-title" style={{ marginTop: '25px' }}>{label}</h1>
          <Row className='justify-content-center zero-margin'>
            <Suspense fallback={<Spinner visible />}>
              <SummaryTable
                feature={feature}
                archives={[archive]}
                technology={technology}
                filters={{
                  ...filters,
                  customFilters: {
                    table_name: table_name,
                  }
                }}
                setFilters={setFilters}
                reportType={L5}
              />
            </Suspense>
          </Row>
        </Col>
      </Row>
      {table_name === '' && (
        <>
          <Row>
            <Col>
              <h1>Download</h1>
              {/* <SimCloudDownload archive_id={archive.id} fileType='html'/> */}
              <SimCloudDownload fileName="GNSS_LOS_HMM_Plot.html" archive_id="a459ddcc-1af9-11ec-89f1-6805ca5d0878"/>
            </Col>
          </Row>
          <Row>
            <Col className="box report-plot">
              <h1 className="plot-title" style={{ marginTop: '25px' }}>
                Time Series Plots
                <HelpTooltip title="Tips" content={<Text>Click and drag on plots to zoom</Text>} />
              </h1>
              <Suspense fallback={<Spinner visible />}>
                <TimeSeries archives={[archive]} technology={technology} feature={feature}  reportType='L5'/>
              </Suspense>
            </Col>
          </Row>
        </>
      )}
    </>
  )
}

export default React.memo(GnssDeviceLevel3Summary)
