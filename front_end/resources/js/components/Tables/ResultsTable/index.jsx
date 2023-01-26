import React, { useEffect, useState } from 'react'
import { Row } from 'react-bootstrap'
import { DataGrid, DataGridRow, DataGridColumn } from '@dx/continuum-data-grid'
import { Badge } from '@dx/continuum-badge'
import { Button } from '@dx/continuum-button'
import { Text, Icons, Input } from '@tidbits/react-tidbits'
import {
  Link, useHistory
} from 'react-router-dom'
import { Toggle } from '@dx/continuum-toggle'

import FieldTestLink from '../../Widgets/FieldTestLink'
import DetailsLink from '../../Widgets/DetailsLink'
import PipelineStatusBar from '../../Widgets/PipelineStatusBar'
import {
  reProcessItems,
  getPipelineStatus,
  downloadArchive,
  isValidBuildTrain,
  isValidModelHardware,
  isFailedPipelineState,
  addToObject,
  size,
  dateToString,
  timestampToISOString,
  getTestNamePrefix
} from '../../../utilities/helpers'
import {
  ARCHIVE_COMPLETED_STATUS, FITNESS_FEATURES, CTP, PERFORMANCE
} from '../../../utilities/constants'
import {
  ARCHIVE_COLUMNS, ZAXIS_COLUMNS, FIELD_TEST_COLUMNS, TEST_DATE_COLUMNS, CTP_COLUMNS, ERA_COLUMNS, CTP_TREND_COLUMNS, MICROLOCATION_COLUMNS, DAILY_REPORT_COLUMNS
} from './constants'
import SideNav from '../../Widgets/SideNav'
import Box from '../../Box'

const _ = require('underscore')
const shortid = require('shortid')

const CUSTOM_SELECTIONS = 'custom-selections'

const getColumns = (type) => {
  switch (type) {
    case 'ARCHIVE':
      return ARCHIVE_COLUMNS
    case 'ZAXIS':
      return ZAXIS_COLUMNS
    case 'ERA':
      return ERA_COLUMNS
    case 'FIELDTEST':
      return FIELD_TEST_COLUMNS
    case CTP:
      return CTP_COLUMNS
    case 'CTP_TREND':
      return CTP_TREND_COLUMNS
    case 'MICROLOCATION':
      return MICROLOCATION_COLUMNS
    case 'DAILY_REPORT':
      return DAILY_REPORT_COLUMNS
    default:
  }
}

const getPageSize = (type) => {
  switch (type) {
    case 'FIELDTEST':
      return 200
    case CTP:
      return 100
    default:
      return 10
  }
}

const handleDateSelect = (testDate, setSelections) => {
  setSelections((prevSelections) => {
    const { tests: prevTests, testDates: prevTestDates } = prevSelections
    if (prevTestDates.includes(testDate)) {
      return {
        ...prevSelections,
        testDates: _.without(prevTestDates, testDate)
      }
    }
    const newTests = prevTests.filter(test => test.testDate !== testDate)
    return {
      tests: newTests,
      testDates: prevTestDates.concat(testDate)
    }
  })
}

const handleTestSelect = (test, setSelections) => {
  setSelections((prevSelections) => {
    const { tests: prevTests } = prevSelections
    if (_.find(prevTests, prevTest => prevTest.testId === test.testId)) {
      return {
        ...prevSelections,
        tests: prevTests.filter(prevTest => prevTest.testId !== test.testId)
      }
    }
    return {
      ...prevSelections,
      tests: prevTests.concat(test)
    }
  })
}

const getDevices = (archives) => {
  const devices = []
  const buildTrains = []
  archives.forEach((archive) => {
    const { build_train, model_hardware, pipelinestate } = archive
    if (isValidModelHardware(model_hardware)) {
      devices.push([model_hardware, pipelinestate])
    }
    if (!buildTrains.includes(build_train) && isValidBuildTrain(build_train)) {
      buildTrains.push(build_train)
    }
  })
  devices.sort((a, b) => a[0] > b[0] ? 1 : -1)
  buildTrains.sort()
  return [devices, buildTrains]
}

const createDeviceBadges = (devices, defaultVariant) => {
  if (devices.length > 0) {
    return devices.map((device) => {
      let [deviceName, pipelineState] = device
      const pipelineStatus = getPipelineStatus(pipelineState)
      if (deviceName === 'Special') deviceName = 'Reference'
      if (pipelineStatus === 'Uploading' || pipelineStatus === 'Uploaded') deviceName = pipelineStatus
      switch (true) {
        case pipelineState === ARCHIVE_COMPLETED_STATUS:
          return <Badge key={shortid.generate()} variant="confirm">{deviceName}</Badge>
        case isFailedPipelineState(pipelineState):
          return <Badge key={shortid.generate()} variant="danger">{deviceName}</Badge>
        case deviceName === 'PENDING':
          return <Badge key={shortid.generate()} variant="notice">{deviceName}</Badge>
        default:
          return <Badge key={shortid.generate()} variant={defaultVariant}>{deviceName}</Badge>
      }
    })
  }
  return <Badge variant="danger">NOT_FOUND</Badge>
}

const createBuildBadges = (builds, defaultVariant) => {
  if (builds.length > 0) {
    return builds.map(build => (
      <Badge
        key={shortid.generate()}
        variant={defaultVariant}
      >
        {build}
      </Badge>
    ))
  }
  return <Badge variant="danger">NOT_FOUND</Badge>
}

const getPassFailBadge = (passCondition) => {
  if (passCondition) return <Badge variant="confirm">YES</Badge>
  return <Badge variant="danger">NO</Badge>
}

const parseZaxis = radar => ({
  'Test Date': dateToString(new Date(timestampToISOString(radar.timestamp))).split(' ')[0],
  Radar: <a href={`rdar://${radar.radar_id}`}>{radar.radar_id}</a>,
  'Build Version': radar.build_version,
  'Client Version': radar.client_version,
  'Floor Error': radar.detected_floor !== null ? 0 : radar.actual_floor - radar.expected_floor,
  Location: radar.detected_location ? radar.detected_location.split(', ').slice(1, 3).join(', ') : radar.actual_location.split(', ').slice(1, 3).join(', '),
  'Address Correct': getPassFailBadge(!radar.is_address_discrepancy),
  Altitude: Number(radar.altitude),
  'Vertical Uncertainty': Number(radar.vertical_uncertainty),
  'Baro Alt Used': radar.baro_alt_used !== null ? getPassFailBadge(radar.baro_alt_used) : 'N/A',
  'WiFi SLAM Used': radar.wifi_slam_used !== null ? getPassFailBadge(radar.wifi_slam_used) : 'N/A',
  'WiFi SLAM Available': radar.wifi_slam_available !== null ? getPassFailBadge(radar.wifi_slam_available) : 'N/A',
  'DEM Alt Available': radar.dem_based_alt_available !== null ? getPassFailBadge(radar.dem_based_alt_available) : 'N/A',
  'Ref Alt Available': radar.ref_based_alt_available !== null ? getPassFailBadge(radar.ref_based_alt_available) : 'N/A',
  Search: radar.radar_id
})

const parseMicrolocation = (results) => {
  const output = results.map(function(item) {
    return {
      'Learning Mode': item.learning_mode,
      'Date': item.date,
      'Tech Config': item.tech_config,
      'Test Pass': item.test_pass,
      'Row Index': item.row_index,
      'Description': item.description,
      'Bats Container': item.bats_container,
      'Corelocation Git SHA': item.corelocation_git_sha,
      'Bolt Task Id': item.bolt_task_id,
      'Software Version': item.sw_ver,
      'Microlocation Version': item.microlocation_version,
      'Color': item.color,
    }
  })
  return output
}

const parseEra = (radar) => {
  const getBadge = () => {
    if (!radar.decision) {
      return 'No user feedback'
    }
    if (!radar.result) {
      return <Badge variant="info">Empty logstitch</Badge>
    }
    if (radar.decision === 'incorrect' || radar.result === 'fail') {
      return <Badge variant="danger">FAIL</Badge>
    }
    if (radar.decision === 'correct' && radar.result && radar.result !== 'fail') {
      return <Badge variant="confirm">PASS</Badge>
    }
  }

  return {
    'Test Date': dateToString(new Date(timestampToISOString(radar.timestamp))).split(' ')[0], 
    Radar: <a href={`rdar://${radar.radar_id}`}>{radar.radar_id}</a>,
    'Client Version': radar.hasOwnProperty('client_version') ? radar.client_version : 'n/a',
    Name: radar.name,
    'Query Made': getPassFailBadge(radar.eraquerymade),
    Pass: getBadge(),
    'Logstitch Result': radar.result,
    'Feedback Decision': radar.decision,
    'Fail Reason': radar.failreason,
    Source: radar.erasource,
    'Me Card': String(radar.mecard),
    Distance: Number(radar.eradist),
    Search: radar.radar_id
  }
}

const parseCTPTrend = entry => ({
  'Group': entry.group,
  'Test Name': entry.tcName,
  TSTT: <a href={entry.tstt.slice(1, -1)}>{entry.tstt}</a>,
  Pass: getPassFailBadge(entry.pass),
  '# Passing': `${entry.numPassing} / ${entry.total}`,
  Search: entry.tstt,
  subSearch: entry.pass ? 'YES' : 'NO',
})

const handleSpecialNameProcessing = (technology, feature, name, testDate) => {
  if ((technology === 'GNSS' && FITNESS_FEATURES.includes(feature)) || (technology === 'E911')) {
    const newName = []
    const prefixes = name.split(' ')
    prefixes.forEach((prefix) => {
      if (prefix === '/') newName.push(<span>{' / '}</span>)
      else {
        newName.push(
          <Link key={shortid.generate()} to={`/technology/${technology}/${feature}/report/q?testDate=${testDate}&testName=${prefix}`}>
            {prefix}
          </Link>
        )
      }
    })
    return newName
  }
  return name
}

const parseFieldTestArchives = (archives, testDate, setData, selectionState) => {
  const [selections, setSelections] = selectionState
  const {
    technology,
    feature
  } = archives[0]
  let name = ''
  const testMapping = {}
  archives.forEach((archive) => {
    const { fieldtest: testId, fieldtest_name: testName } = archive
    name += getTestNamePrefix(testName, name)
    addToObject(testMapping, testId, [archive])
  })
  name = handleSpecialNameProcessing(technology, feature, name, testDate)
  const handleDateClick = () => {
    setData((prevData) => {
      let newData = []
      prevData.forEach((prevRow, i) => {
        const isMatchingTestDate = prevRow.Search && prevRow.testDate === testDate
        if (!prevRow.Show && isMatchingTestDate) {
          const rowsToShow = Object.entries(testMapping).map(([testId, testArchives]) => {
            const { fieldtest_name: testName } = testArchives[0]
            const [devices, buildTrains] = getDevices(testArchives)
            const test = { testId, testName, testDate }
            return {
              'Test Date': <span style={{ float: 'right' }}><Icons.RightIcon width="10px" height="8px" /></span>,
              'Test Name': <FieldTestLink name={testName} technology={technology} feature={feature} fieldTestId={testId} />,
              Devices: createDeviceBadges(devices, 'primary'),
              'Build Train': createBuildBadges(buildTrains, 'info'),
              Details: <DetailsLink itemType="Fieldtest" itemId={testId} />,
              subSearch: `${testDate} ${(devices.length > 0 ? devices.map(device => device[0]) : 'NOT_FOUND')} ${(buildTrains.length > 0 ? buildTrains : 'NOT_FOUND')}`,
              test: JSON.stringify(test),
              testDate,
              Select: <Input.CircleCheckbox
                cursor="pointer"
                disabled={prevRow.Select.props.checked}
                checked={_.find(selections.tests, t => t.testId === testId) || prevRow.Select.props.checked}
                onChange={() => handleTestSelect(test, setSelections)}
              />
            }
          })
          prevRow['Test Date'] = (
            <span className="test-date-dropdown" onClick={() => handleDateClick()}>
              {testDate}
              {' '}
              <Icons.UpIcon width="10px" height="10px" />
            </span>
          )
          prevRow.Show = true
          newData = prevData.slice(0, i + 1).concat(rowsToShow).concat(prevData.slice(i + 1))
        } else if (isMatchingTestDate) {
          prevRow['Test Date'] = (
            <span className="test-date-dropdown" onClick={() => handleDateClick()}>
              {testDate}
              {' '}
              <Icons.DownIcon width="10px" height="10px" />
            </span>
          )
          prevRow.Show = false
          newData = prevData.slice(0, i + 1).concat(prevData.slice(i + 1 + size(testMapping)))
        }
      })
      return newData
    })
  }
  const [devices, buildTrains] = getDevices(archives)
  return {
    'Test Date': (
      <span className="test-date-dropdown" onClick={() => handleDateClick()}>
        {testDate}
        {' '}
        <Icons.DownIcon width="10px" height="10px" />
      </span>
    ),
    'Test Name': name,
    Devices: createDeviceBadges(devices, 'primary'),
    'Build Train': createBuildBadges(buildTrains, 'info'),
    Details: `Total Devices: ${devices.length}`,
    Search: `${(devices.length > 0 ? devices.map(device => device[0]) : 'NOT_FOUND')} ${(buildTrains.length > 0 ? buildTrains : 'NOT_FOUND')}`,
    Show: false,
    testDate,
    Select: <Input.CircleCheckbox
      cursor="pointer"
      checked={selections.testDates.includes(testDate)}
      onChange={() => handleDateSelect(testDate, setSelections)}
    />
  }
}

const parseCTPArchives = (archives, testDate) => {
  const {
    technology,
    feature
  } = archives[0]
  let name = ''
  archives.forEach((archive) => {
    const { fieldtest_name: testName } = archive
    name += getTestNamePrefix(testName, name)
  })
  const [devices, buildTrains] = getDevices(archives)
  devices.sort((a, b) => a[0] > b[0] ? 1 : -1)
  buildTrains.sort()
  return {
    'Test Date': testDate,
    Report: (
      <Link to={`/technology/${technology}/${feature}/CTP/report/q?testDate=${testDate}`}>
        {`${name}`}
      </Link>
    ),
    Devices: createDeviceBadges(devices, 'primary'),
    'Build Train': createBuildBadges(buildTrains, 'info'),
    deviceSearch: (devices.length > 0 ? devices.map(device => device[0]) : 'NOT_FOUND'),
    buildTrainSearch: (buildTrains.length > 0 ? buildTrains : 'NOT_FOUND')
  }
}

const parseArchive = (archive, setData, setResultsState) => {
  const {
    test_date: testDate,
    fieldtest_name: testName,
    fieldtest: testId,
    id: archiveId,
    pipelinestate: archiveState,
    model_hardware: modelHardware,
    device_serial_number: serialNumber,
    build_train: buildTrain,
    build_version: buildVersion,
    technology,
    feature
  } = archive

  const handleClick = (selectedArchiveId, jobId, archive_type) => {
    const callBack = () => {
      setData((prevData) => {
        const newData = prevData.slice()
        prevData.forEach((prevRow, i) => {
          if (prevRow.ArchiveId === selectedArchiveId) {
            newData[i]['Pipeline Status'] = 'Reprocessing...'
            newData[i][' '] = null
          }
        })
        return newData
      })
      setResultsState(prevState => ({
        ...prevState,
        isReprocessing: true
      }))
    }
    // Not call now. Keep in case need
    reProcessItems([archiveId], 'ARCHIVE', jobId, archive_type, callBack, msg => alert(msg))
  }

  return {
    'Test Date': testDate,
    'Test Name': <FieldTestLink name={testName} technology={technology} feature={feature} fieldTestId={testId} />,
    Device: createDeviceBadges([[`${modelHardware}_${serialNumber}`, archiveState]], 'primary'),
    Build: createBuildBadges([`${buildTrain}_${buildVersion}`], 'info'),
    Details: <DetailsLink itemId={archiveId} itemType="Archive" popupType='Details' />,
    'Pipeline Status': <PipelineStatusBar archive={archive} />,
    ' ': <DetailsLink itemId={archiveId} itemType="Archive" popupType='ReProccess' />,
    Download: (
      <Button variant="confirm" onClick={() => downloadArchive(archiveId)}>
        <Icons.DownloadCloudIcon width="20px" height="20px" />
      </Button>
    ),
    Report: (
      <Link to={`/technology/${technology}/${feature}/device/${archiveId}`}>View</Link>
    ),
    ArchiveId: archiveId,
    Search: `${testName} ${modelHardware} ${buildTrain} ${getPipelineStatus(archiveState)} ${archiveState}`
  }
}

const parseDailyReport = (results) => {
  let output = []
  if (!results || !results.length > 0)
    return output
  results.forEach((item) => {
    const { info } = item?.description || null;
    output.push({
      'Learning Mode': item?.learning_mode,
      'Date': item?.time,
      'Tech Config': item?.tech_config,
      'DB Name': item?.db_name,
      'Metric Name': item?.metric_name,
      'Metric Value': item?.metric_value,
      'Metric Bm Value': item?.metric_bm_value,
      'Row Index': item?.row_index,
      'Description': info,
      'Bats Container': item?.bats_container,
      'Corelocation Git SHA': item?.corelocation_git_sha,
      'Bolt Task Id': item?.bolt_task_id,
      'Software Version': item?.sw_ver,
      'Microlocation Version': item?.microlocation_version,
      'Train Name': item?.train_name,
    })
  })
  return output
}

const ResultsTable = ({
  technology, feature, results, type, setResultsState = null, handleRowClick = null
}) => {
  const history = useHistory()
  const [data, setData] = useState([])
  const [showSelection, setShowSelection] = useState(false)
  const [selections, setSelections] = useState({
    testDates: [],
    tests: []
  })
  const columns = getColumns(type)

  useEffect(() => {
    let newData
    switch (type) {
      case 'ARCHIVE':
        newData = _.map(results, archive => parseArchive(archive, setData, setResultsState))
        newData.sort((a, b) => a['Test Date'] < b['Test Date'] ? 1 : -1)
        break
      case 'ZAXIS':
        newData = _.map(results.entries, entry => parseZaxis(entry))
        newData.sort((a, b) => a['Test Date'] < b['Test Date'] ? 1 : -1)
        break
      case 'ERA':
        newData = _.map(results.entries, entry => parseEra(entry))
        newData.sort((a, b) => a['Test Date'] < b['Test Date'] ? 1 : -1)
        break
      case 'FIELDTEST':
        newData = _.map(results, (archives, testDate) => parseFieldTestArchives(archives, testDate, setData, [selections, setSelections]))
        newData.sort((a, b) => a.testDate < b.testDate ? 1 : -1)
        break
      case CTP:
        newData = _.map(results, (archives, testDate) => parseCTPArchives(archives, testDate))
        newData.sort((a, b) => a['Test Date'] < b['Test Date'] ? 1 : -1)
        break
      case 'CTP_TREND':
        newData = _.map(results.entries, entry => parseCTPTrend(entry))
        newData.sort((a, b) => a['Test Date'] < b['Test Date'] ? 1 : -1)
        break
      case 'MICROLOCATION':
        newData = parseMicrolocation(results)
        newData.sort((a, b) => a['Test Date'] < b['Test Date'] ? 1 : -1)
        break
      case 'DAILY_REPORT':
        newData = parseDailyReport(results);
        newData.sort((a, b) => a['Date'] < b['Date'] ? 1 : -1)
        break
      default:
    }
    setData(newData)
  }, [results, type])

  useEffect(() => {
    if (showSelection) {
      setData(prevData => prevData.map((row) => {
        const { test: testString, testDate } = row
        const test = testString ? JSON.parse(testString) : {}
        if ('Search' in row) {
          row.Select = (
            <Input.CircleCheckbox
              cursor="pointer"
              checked={selections.testDates.includes(testDate)}
              onChange={() => handleDateSelect(testDate, setSelections)}
            />
          )
        } else if ('subSearch' in row) {
          const selected = _.find(selections.tests, t => t.testId === test.testId) || selections.testDates.includes(testDate)
          row.Select = (
            <Input.CircleCheckbox
              cursor="pointer"
              disabled={selected && selections.testDates.includes(testDate)}
              checked={selected}
              onChange={() => handleTestSelect(test, setSelections)}
            />
          )
        }
        return row
      }))
    }
  }, [selections])

  const handleToggle = () => {
    setShowSelection(prevSelection => !prevSelection)
  }

  const handleSubmit = () => {
    const baseUrl = `/technology/${technology}/${feature}/${PERFORMANCE}/report/q?`
    let params = ''
    Object.entries(selections).forEach(([key, value]) => {
      if (value.length > 0) {
        if (params) params += '&'
        if (key === 'tests') params += `testId=${value.map(test => test.testId).join('+')}`
        else params += `${key.slice(0, key.length - 1)}=${value.join('+')}`
      }
    })
    if (!params) return
    params += '&operator=OR'
    history.push(baseUrl + params)
  }

  const handleDelete = () => {
    setSelections({
      testDates: [],
      tests: []
    })
  }

  const selectionColumns = (showSelection && type === 'FIELDTEST') ? ['Select'] : []

  console.log('Rendering Results Table')
  return (
    <div className={showSelection ? 'table-with-select' : ''} style={{ width: '100%' }}>
      {(type === 'FIELDTEST') && (
        <>
          <div>
            <Text mr="5px" style={{ display: 'inline', fontSize: 16}}>Combine Test Reports</Text>
            <Toggle
              style={{ display: 'inline' }}
              checked={showSelection}
              onChange={handleToggle}
            />
          </div>
          {showSelection && (
            <SideNav elementId={CUSTOM_SELECTIONS}>
              <Row className="justify-content-center">
                <Button
                  size="large"
                  variant="primary"
                  disabled={Object.values(selections).flat().length === 0}
                  onClick={handleSubmit}
                >
                  Generate Report
                </Button>
              </Row>
              <Row className="justify-content-center" style={{ marginTop: '10px' }}>
                <Button
                  size="small"
                  onClick={handleDelete}
                  disabled={Object.values(selections).flat().length === 0}
                >
                  Clear Selections
                </Button>
              </Row>
              <div style={{ textAlign: 'center' }}>
                <Text textStyle="h5Regular" mt="15px">Selected Tests:</Text>
                {selections.testDates.map(date => <Box><Text p="5px">{date}</Text></Box>)}
                {selections.tests.map(t => <Box><Text p="5px">{`${t.testName} ${t.testDate}`}</Text></Box>)}
              </div>
            </SideNav>
          )}
        </>
      )}
      <DataGrid
        data={data}
        pageSize={getPageSize(type)}
      >
        <DataGridRow>
          {selectionColumns.concat(columns).map(column => (
            <DataGridColumn key={column} field={column} />
          ))}
        </DataGridRow>
      </DataGrid>
    </div>
  )
}

export default React.memo(ResultsTable)