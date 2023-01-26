// You need to provide your own config. See below 'Config format'
/* eslint no-shadow: ["error", { "allow": ["state"] }] */
import { BasicConfig } from 'react-awesome-query-builder'

const _ = require('underscore')

const widgets = {
  ...BasicConfig.widgets,
  // examples of  overriding
  text: {
    ...BasicConfig.widgets.text,
    validateValue: (val, fieldDef) => (val.length < 10)
  },
  slider: {
    ...BasicConfig.widgets.slider,
    customProps: {
      width: '300px'
    }
  },
  rangeslider: {
    ...BasicConfig.widgets.rangeslider,
    customProps: {
      width: '300px'
    }
  },
  date: {
    ...BasicConfig.widgets.date,
    dateFormat: 'DD.MM.YYYY',
    valueFormat: 'YYYY-MM-DD'
  },
  time: {
    ...BasicConfig.widgets.time,
    timeFormat: 'HH:mm',
    valueFormat: 'HH:mm:ss'
  },
  datetime: {
    ...BasicConfig.widgets.datetime,
    timeFormat: 'HH:mm',
    dateFormat: 'DD.MM.YYYY',
    valueFormat: 'YYYY-MM-DD HH:mm:ss'
  },
  func: {
    ...BasicConfig.widgets.func,
    customProps: {
      showSearch: true
    }
  },
  treeselect: {
    ...BasicConfig.widgets.treeselect,
    customProps: {
      showSearch: true
    }
  }
}
export function getConfig(distinct) {
  if (!distinct) {
    return { ...BasicConfig }
  }
  return {
    ...BasicConfig,
    fields: {
      'fieldtests_technology.name': {
        label: 'Technology',
        type: 'select',
        valueSources: ['value'],
        listValues: _.map(distinct.technologies, technology => ({ value: technology, title: technology }))
      },
      'fieldtests_feature.name': {
        label: 'Feature',
        type: 'select',
        valueSources: ['value'],
        listValues: _.map(distinct.features, feature => ({ value: feature, title: feature }))
      },
      'fieldtests_fieldtest.test_date': {
        label: 'Test Date',
        type: 'date',
        valueSources: ['value']
      },
      // ////////////////////////
      'fieldtests_archive.build_train': {
        label: 'Build Train',
        type: 'select',
        valueSources: ['value'],
        listValues: _.map(distinct.build_train, buildTrain => ({ value: buildTrain, title: buildTrain }))
      },
      'fieldtests_archive.build_version': {
        label: 'Build Version',
        type: 'select',
        valueSources: ['value'],
        listValues: _.map(distinct.build_version, buildVersion => ({ value: buildVersion, title: buildVersion }))
      },
      'fieldtests_archive.model_hardware': {
        label: 'Model Hardware',
        type: 'select',
        valueSources: ['value'],
        listValues: _.map(distinct.model_hardware, modelHardware => ({ value: modelHardware, title: modelHardware }))
      },
      'fieldtests_archive.device_ecid': {
        label: 'Device EcId',
        type: 'select',
        valueSources: ['value'],
        listValues: _.map(distinct.device_ecid, deviceEcid => ({ value: deviceEcid, title: deviceEcid }))
      },
      'fieldtests_archive.device_serial_number': {
        label: 'Device Serial Number',
        type: 'select',
        valueSources: ['value'],
        listValues: _.map(distinct.device_serial_number, deviceSerialNumber => ({ value: deviceSerialNumber, title: deviceSerialNumber }))
      },
      'fieldtests_archive.device_type': {
        label: 'Device Type',
        type: 'select',
        valueSources: ['value'],
        listValues: _.map(distinct.device_type, deviceType => ({ value: deviceType, title: deviceType }))
      },
      'fieldtests_archivetype.name': {
        label: 'Archive Type',
        type: 'select',
        valueSources: ['value'],
        listValues: _.map(distinct.archivetypes, archiveType => ({ value: archiveType, title: archiveType }))
      },
      'fieldtests_pipelinestate.name': {
        label: 'Pipeline Status',
        type: 'select',
        valueSources: ['value'],
        listValues: _.map(distinct.pipelinestates, pipelinestate => ({ value: pipelinestate, title: pipelinestate }))
      },
      'fieldtests_archive.id': {
        label: 'Archive ID',
        type: 'text',
        valueSources: ['value']
      },
      'fieldtests_fieldtest.id': {
        label: 'Fieldtest ID',
        type: 'text',
        valueSources: ['value']
      }


    }
  }
}
const configMapping = {
  'fieldtests_technology.name': 'technology',
  'fieldtests_feature.name': 'feature',
  'fieldtests_fieldtest.test_date': 'test_date',
  'fieldtests_fieldtest.id': 'fieldtest_id',
  'fieldtests_archive.build_train': 'build_train',
  'fieldtests_archive.build_version': 'build_version',
  'fieldtests_archive.model_hardware': 'model_hardware',
  'fieldtests_archive.device_ecid': 'device_ecid',
  'fieldtests_archive.device_serial_number': 'device_serial_number',
  'fieldtests_archive.device_type': 'device_type',
  'fieldtests_archivetype.name': 'archive_type',
  'fieldtests_archive.id': 'archive_id',
  'fieldtests_pipelinestate.name': 'pipelinestate'
}

export function queryStringConverter(queryString) {
  let newQueryString = queryString
  const keys = Object.keys(configMapping)
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i]
    const value = configMapping[key]
    const re = new RegExp(key, 'g')
    newQueryString = newQueryString.replace(re, value)
  }
  return newQueryString
}
