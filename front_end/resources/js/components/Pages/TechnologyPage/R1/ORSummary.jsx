/* eslint-disable react/prop-types */
import React, { Suspense, lazy, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Row, Col
} from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import { StatePanel } from '@dx/continuum-state-panel'

import { useFetchArchiveData } from '../../../../hooks/fetchData'
import { isEmpty, setDefaultObject, createArchiveLabel } from '../../../../utilities/helpers'
import { TRUTH_TABLE, ARCHIVE_REPORTING_LOGS } from '../../../../utilities/constants'
import Box from '../../../Box'
import BaseTable from '../../../Tables/BaseTable'
import { Link } from 'react-router-dom'

const DeviceCrashes = lazy(() => import('../DeviceCrashes'))
const _ = require('underscore')

const technology = "R1"
const feature = "OR"

const ErrorMessage = () => (
  <StatePanel
    message="Error- could not find truth summary data."
    suggestion="Data may still be processing."
  />
)


const ORSummary = ({
  archives,
}) => {
  const [specialArchive] = archives.filter(archive => archive.build_train.toUpperCase() === 'SPECIAL')
  const [device] = archives.filter(archive => archive.build_train.toUpperCase() !== 'SPECIAL')
  const { tableName, responderColumn, initiatorColumn, continuousColumn, intermittentColumn } = TRUTH_TABLE[technology][feature]
  const [isLoading, archivesInfo] = useFetchArchiveData([specialArchive.id], ARCHIVE_REPORTING_LOGS, tableName)
  const [state, setState] = useState({
    isProcessing: true,
    tableData: [],
    headerColumns: {},
    subHeaderColumns: [],
  })
  const { errorMessage } = archivesInfo
  const { tableData, headerColumns, subHeaderColumns, isProcessing } = state

  useEffect(() => {
    if (!isLoading && !errorMessage) {
      const archiveData = archivesInfo[specialArchive.id]
      if (!isEmpty(archiveData)) {
        const {
          [responderColumn]: responderOrientations,
          [initiatorColumn]: initiatorOrientations,
          [continuousColumn]: continuousOpRanges,
          [intermittentColumn]: intermittentOpRanges,
        } = archiveData
        const indexMapping = {}
        responderOrientations.forEach((respOrientation, i) => {
          const initOrientation = initiatorOrientations[i]
          indexMapping[respOrientation + initOrientation] = i
        })
        const uniqueResponderOrientations = _.uniq(responderOrientations)
        const newHeaderColumns = { '': 1 }
        const newSubHeaderColumns = ['']
        uniqueResponderOrientations.forEach((orientation) => {
          newHeaderColumns[orientation] = 2
          newSubHeaderColumns.push(...['Continuous', 'Intermittent'])
        })
        const uniqueInitiatorOrientations = _.uniq(initiatorOrientations)
        const newTableData = []
        uniqueInitiatorOrientations.forEach((initOrientation) => {
          const tableRow = [{ value: initOrientation }]
          uniqueResponderOrientations.forEach((respOrientation) => {
            const index = indexMapping[respOrientation + initOrientation]
            const contOpRange = continuousOpRanges[index] || '-'
            const intOpRange = intermittentOpRanges[index] || '-'
            tableRow.push(...[{ value: contOpRange }, { value: intOpRange }])
          })
          newTableData.push(tableRow)
        })
        setState({
          headerColumns: newHeaderColumns,
          subHeaderColumns: newSubHeaderColumns,
          tableData: newTableData,
        })
      }
      setState(prevState => ({
        ...prevState,
        isProcessing: false
      }))
    }
  }, [isLoading, errorMessage, archivesInfo])

  return (
    !isProcessing && tableData.length === 0 ? (
      <ErrorMessage />
    ) : (
      <>
        <Box title="Summary Table" type="report-table" isLoading={isLoading}>
          <BaseTable headerColumns={headerColumns} subHeaderColumns={subHeaderColumns} tableData={tableData} />
        </Box>
        <Box title=" " subTitle={<Link to={`/technology/${technology}/${feature}/device/${device.id}`}>{`View Plots for ${createArchiveLabel(device).label}`}</Link>} />
        <DeviceCrashes archives={archives} />
      </>
    )
  )
}

ORSummary.propTypes = {
  archives: PropTypes.array.isRequired
}

export default React.memo(ORSummary)
