/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import {
  Row, Col
} from 'react-bootstrap'
import { Text } from '@tidbits/react-tidbits'

import HelpTooltip from '../../../Widgets/HelpTooltip'
import { useFetchArchiveData } from '../../../../hooks/fetchData'
import { ARCHIVE_REPORTING_LOGS, KPI_TABLE } from '../../../../utilities/constants'
import { getIndices, setDefaultObject, isEmpty } from '../../../../utilities/helpers'
import Box from '../../../Box'

const TimeSeries = lazy(() => import('../../../Plots/TimeSeries'))
const GroupBarPlot = lazy(() => import('../../../Plots/GroupBarPlot'))

const ADDITIONAL_COLUMNS = [
  'x_label',
  'style'
]

const WsbPlots = ({
  archive,
}) => {
  const { tableName, columns } = KPI_TABLE.CLX.WSB
  const [isLoading, archivesInfo] = useFetchArchiveData([archive.id], ARCHIVE_REPORTING_LOGS, tableName, columns.concat(ADDITIONAL_COLUMNS))
  const [barChartMapping, setBarChartMapping] = useState({})

  useEffect(() => {
    if (!isLoading) {
      const [archiveData] = Object.values(archivesInfo)
      if (!isEmpty(archiveData)) {
        const newBarChartMapping = {}
        const barIndices = getIndices(archiveData, _.range(archiveData[columns[0]].length), 'style', 'bar')
        barIndices.forEach((idx) => {
          const plotName = archiveData.table_name[idx]
          const xLabel = archiveData.x_label[idx]
          const xValue = archiveData.x_axis[idx]
          const yValue = archiveData.double_value[idx]
          setDefaultObject(newBarChartMapping, plotName)
          setDefaultObject(newBarChartMapping[plotName], xValue)
          newBarChartMapping[plotName][xValue][xLabel] = yValue
        })
        setBarChartMapping(newBarChartMapping)
      }
    }
  }, [isLoading, archivesInfo])

  console.log(archivesInfo)

  console.log('Rendering WsbPlots')
  return (
    <>
      <Row>
        <Box
          title={<>
            Time Series Plots
            <HelpTooltip title="Tips" content={<Text>Click and drag on plots to zoom</Text>} />
          </>}
          isLoading={isLoading}
          type="report-plot"
        >
          {!isEmpty(archivesInfo) && (
            <Col>
              <TimeSeries archives={[archive]} technology="CLX" feature="WSB" loadedData={archivesInfo} />
            </Col>
          )}
        </Box>
      </Row>
      <Row>
        <Box title="Bar Plots" isLoading={isLoading} type="report-plot">
          {Object.entries(barChartMapping).map(([name, data]) => (
            <GroupBarPlot key={name} data={data} title={name}/>
          ))}
        </Box>
      </Row>
    </>
  )
}

export default React.memo(WsbPlots)
