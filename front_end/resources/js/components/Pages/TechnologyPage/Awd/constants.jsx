export const BUILD_TRAIN_MAPPING = {
  IPHONE: {
    20: 'Sydney',
    19: 'Sky',
    18: 'Azul',
    17: 'Yukon',
    16: 'Peace'
  },
  WATCH: {
    20: 'Kincaid',
    19: 'Jupiter',
    18: 'Hunter',
    17: 'Grace',
    16: 'Glory'
  },
  IPAD: {}
}

export const BOUNDS = {
  accuracy: [
    -1,
    0.0,
    5.0,
    10.0,
    15.0,
    20.0,
    25.0,
    30.0,
    35.0,
    40.0,
    45.0,
    50.0,
    55.0,
    60.0,
    65.0,
    70.0,
    75.0,
    80.0,
    100.0,
    150.0,
    200.0,
    400.0,
    1000.0,
    1500.0,
    2000.0,
    4000.0,
    6000.0,
    10000.0
  ],
  vacc: [
    -1,
    0.0,
    5.0,
    10.0,
    15.0,
    20.0,
    25.0,
    30.0,
    35.0,
    40.0,
    45.0,
    50.0,
    55.0,
    60.0,
    65.0,
    70.0,
    75.0,
    80.0,
    100.0,
    150.0,
    200.0,
    400.0,
    1000.0,
    1500.0,
    2000.0,
    4000.0,
    6000.0,
    10000.0
  ],
  ttff: [
    -1,
    0.0,
    1.0,
    2.0,
    3.0,
    4.0,
    5.0,
    6.0,
    7.0,
    8.0,
    9.0,
    10.0,
    11.0,
    12.0,
    13.0,
    14.0,
    15.0,
    16.0,
    17.0,
    18.0,
    19.0,
    20.0,
    21.0,
    22.0,
    23.0,
    24.0,
    25.0,
    26.0,
    27.0,
    28.0,
    29.0,
    30.0,
    60.0,
    120.0
  ]
}

export const DEFAULT_PLOTS = {
  E911: [
    {
      id: 1,
      name: 'Not in Active Emergency Sessions By Type, Count per Network',
      tableInfo: {
        log_name: 'r_awd_e911_is_in_active_emgency_study',
        columns: [
          { column_name: 'country', column_type: 'Text' },
          { column_name: 'network', column_type: 'Text' },
          { column_name: 'session_type', column_type: 'Text' },
          { column_name: 'is_in_active_emergency', column_type: 'Int' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_e911_is_in_active_emgency_study',
        plotType: 'BAR',
        filters: [{ key: 'is_in_active_emergency', operation: '=', values: [0] }],
        categories: ['network'],
        maxXTicks: 20,  // show max 20 networks
        subCategories: ['session_type'],
        sortBy: 'count',
        sortDirection: '<'
      },
      data: {}
    },
    {
      id: 2,
      name: 'Active Emergency Sessions by Type, Count per Week',
      tableInfo: {
        log_name: 'r_awd_e911_is_in_active_emgency_study',
        columns: [
          { column_name: 'country', column_type: 'Text' },
          { column_name: 'network', column_type: 'Text' },
          { column_name: 'session_type', column_type: 'Text' },
          { column_name: 'is_in_active_emergency', column_type: 'Int' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_e911_is_in_active_emgency_study',
        plotType: 'BAR',
        filters: [{ key: 'is_in_active_emergency', operation: '=', values: [1] }],
        categories: ['dates'],
        maxXTicks: -1,  // default show all
        subCategories: ['session_type'],
        sortBy: 'count',
        sortDirection: '<'
      },
      data: {}
    },
    {
      id: 3,
      name: 'Total Error Codes, Count per Week',
      tableInfo: {
        log_name: 'r_awd_e911_error_code_study_typical_countries',
        columns: [
          { column_name: 'country', column_type: 'Text' },
          { column_name: 'network', column_type: 'Text' },
          { column_name: 'session_type', column_type: 'Text' },
          { column_name: 'gps_vendor', column_type: 'Text' },
          { column_name: 'bb_vendor', column_type: 'Text' },
          { column_name: 'platform', column_type: 'Text' },
          { column_name: 'bb_generation', column_type: 'Text' },
          { column_name: 'build_train', column_type: 'Text' },
          { column_name: 'position_source', column_type: 'Text' },
          { column_name: 'rat_type', column_type: 'Text' },
          { column_name: 'comm_type', column_type: 'Text' },
          { column_name: 'method_type', column_type: 'Text' },
          { column_name: 'error_code', column_type: 'Text' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_e911_error_code_study_typical_countries',
        plotType: 'BAR',
        filters: [],
        categories: ['dates'],
        maxXTicks: -1,  // default show all
        subCategories: ['error_code']
      },
      data: {}
    },
    {
      id: 4,
      name: 'EED Session Error Codes, Count per Country',
      tableInfo: {
        log_name: 'r_awd_e911_error_code_study_typical_countries',
        columns: [
          { column_name: 'country', column_type: 'Text' },
          { column_name: 'network', column_type: 'Text' },
          { column_name: 'session_type', column_type: 'Text' },
          { column_name: 'gps_vendor', column_type: 'Text' },
          { column_name: 'bb_vendor', column_type: 'Text' },
          { column_name: 'platform', column_type: 'Text' },
          { column_name: 'bb_generation', column_type: 'Text' },
          { column_name: 'build_train', column_type: 'Text' },
          { column_name: 'position_source', column_type: 'Text' },
          { column_name: 'rat_type', column_type: 'Text' },
          { column_name: 'comm_type', column_type: 'Text' },
          { column_name: 'method_type', column_type: 'Text' },
          { column_name: 'error_code', column_type: 'Text' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_e911_error_code_study_typical_countries',
        plotType: 'BAR',
        filters: [{ key: 'session_type', operation: '=', values: ['EED', 'EED2'] }],
        categories: ['country'],
        maxXTicks: -1,  // default show all
        subCategories: ['session_type', 'error_code']
      },
      data: {}
    },
    {
      id: 5,
      name: 'Horizontal Accuracy for Major Carriers, Count per Achieved Accuracy',
      tableInfo: {
        log_name: 'r_awd_e911_achieved_accuracy_study_typical_countries',
        columns: [
          { column_name: 'country', column_type: 'Text' },
          { column_name: 'network', column_type: 'Text' },
          { column_name: 'session_type', column_type: 'Text' },
          { column_name: 'gps_vendor', column_type: 'Text' },
          { column_name: 'bb_vendor', column_type: 'Text' },
          { column_name: 'platform', column_type: 'Text' },
          { column_name: 'bb_generation', column_type: 'Text' },
          { column_name: 'build_train', column_type: 'Text' },
          { column_name: 'position_source', column_type: 'Text' },
          { column_name: 'rat_type', column_type: 'Text' },
          { column_name: 'comm_type', column_type: 'Text' },
          { column_name: 'method_type', column_type: 'Text' },
          { column_name: 'achieved_accuracy', column_type: 'Int' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_e911_achieved_accuracy_study_typical_countries',
        plotType: 'BAR',
        filters: [
          { key: 'network', operation: '=', values: ['AT&T US', 'Verizon US', 'Sprint US', 'T-Mobile US'] },
        ],
        categories: ['achieved_accuracy'],
        maxXTicks: -1,  // default show all
        subCategories: ['network'],
        plotCdf: true,
      },
      data: {}
    },
    {
      id: 6,
      name: 'Horizontal Accuracy AML for Major Carriers, Count per Achieved Accuracy',
      tableInfo: {
        log_name: 'r_awd_e911_achieved_accuracy_study_typical_countries',
        columns: [
          { column_name: 'country', column_type: 'Text' },
          { column_name: 'network', column_type: 'Text' },
          { column_name: 'session_type', column_type: 'Text' },
          { column_name: 'gps_vendor', column_type: 'Text' },
          { column_name: 'bb_vendor', column_type: 'Text' },
          { column_name: 'platform', column_type: 'Text' },
          { column_name: 'bb_generation', column_type: 'Text' },
          { column_name: 'build_train', column_type: 'Text' },
          { column_name: 'position_source', column_type: 'Text' },
          { column_name: 'rat_type', column_type: 'Text' },
          { column_name: 'comm_type', column_type: 'Text' },
          { column_name: 'method_type', column_type: 'Text' },
          { column_name: 'achieved_accuracy', column_type: 'Int' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_e911_achieved_accuracy_study_typical_countries',
        plotType: 'BAR',
        filters: [
          { key: 'network', operation: '=', values: ['EE UK', 'O2 (Telefonica) UK', 'Vodafone UK', 'Hutchison UK'] },
          { key: 'session_type', operation: '=', values: ['AML'] }
        ],
        categories: ['achieved_accuracy'],
        maxXTicks: -1,  // default show all
        subCategories: ['network'],
        plotCdf: true,
      },
      data: {}
    },
    {
      id: 7,
      name: 'Vertical Accuracy for Major Carriers, Count per Vertical Accuracy',
      tableInfo: {
        log_name: 'r_awd_e911_vacc_study_typical_countries',
        columns: [
          { column_name: 'country', column_type: 'Text' },
          { column_name: 'network', column_type: 'Text' },
          { column_name: 'session_type', column_type: 'Text' },
          { column_name: 'gps_vendor', column_type: 'Text' },
          { column_name: 'bb_vendor', column_type: 'Text' },
          { column_name: 'platform', column_type: 'Text' },
          { column_name: 'bb_generation', column_type: 'Text' },
          { column_name: 'build_train', column_type: 'Text' },
          { column_name: 'position_source', column_type: 'Text' },
          { column_name: 'rat_type', column_type: 'Text' },
          { column_name: 'comm_type', column_type: 'Text' },
          { column_name: 'method_type', column_type: 'Text' },
          { column_name: 'achieved_vertical_accuracy', column_type: 'Int' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_e911_vacc_study_typical_countries',
        plotType: 'BAR',
        filters: [
          { key: 'network', operation: '=', values: ['AT&T US', 'Verizon US', 'Sprint US', 'T-Mobile US'] },
        ],
        categories: ['achieved_vertical_accuracy'],
        maxXTicks: -1,  // default show all
        subCategories: ['network'],
        plotCdf: true,
      },
      data: {}
    },
    {
      id: 8,
      name: 'TTFF by Session Type, Count per TTFF',
      tableInfo: {
        log_name: 'r_awd_e911_ttff_study_typical_countries',
        columns: [
          { column_name: 'country', column_type: 'Text' },
          { column_name: 'network', column_type: 'Text' },
          { column_name: 'session_type', column_type: 'Text' },
          { column_name: 'gps_vendor', column_type: 'Text' },
          { column_name: 'bb_vendor', column_type: 'Text' },
          { column_name: 'platform', column_type: 'Text' },
          { column_name: 'bb_generation', column_type: 'Text' },
          { column_name: 'build_train', column_type: 'Text' },
          { column_name: 'position_source', column_type: 'Text' },
          { column_name: 'rat_type', column_type: 'Text' },
          { column_name: 'comm_type', column_type: 'Text' },
          { column_name: 'method_type', column_type: 'Text' },
          { column_name: 'ttff', column_type: 'Int' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_e911_ttff_study_typical_countries',
        plotType: 'BAR',
        filters: [
          { key: 'network', operation: '=', values: ['AT&T US', 'Verizon US', 'Sprint US', 'T-Mobile US'] },
        ],
        categories: ['ttff'],
        maxXTicks: -1,  // default show all
        subCategories: ['network'],
        plotCdf: true,
      },
      data: {}
    },
    {
      id: 9,
      name: 'World Map Results',
      tableInfo: {
        log_name: 'r_awd_e911_world_result_map',
        columns: [
          { column_name: 'country', column_type: 'Text' },
          { column_name: 'latitude_1degree', column_type: 'Int' },
          { column_name: 'longitude_1degree', column_type: 'Int' },
          { column_name: 'result', column_type: 'Text' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_e911_world_result_map',
        plotType: 'MAP',
        filters: [],
        categories: ['latitude_1degree', 'longitude_1degree'],
        maxXTicks: -1,  // not used for map
        subCategories: ['result']
      },
      data: {}
    },
    // {
    //   id: 10,
    //   name: 'US Map Error Codes',
    //   tableInfo: {
    //     log_name: 'r_awd_e911_us_error_map',
    //     columns: [
    //       { column_name: 'latitude', column_type: 'Int' },
    //       { column_name: 'longitude', column_type: 'Int' },
    //       { column_name: 'error_code', column_type: 'Text' },
    //       { column_name: 'session_type', column_type: 'Text' },
    //       { column_name: 'gps_vendor', column_type: 'Text' },
    //       { column_name: 'platform', column_type: 'Text' },
    //       { column_name: 'bb_generation', column_type: 'Text' },
    //       { column_name: 'build_train', column_type: 'Text' },
    //       { column_name: 'rat_type', column_type: 'Text' },
    //       { column_name: 'method_type', column_type: 'Text' },
    //       { column_name: 'count', column_type: 'Bigint' },
    //     ]
    //   },
    //   settings: {
    //     logName: 'r_awd_e911_us_error_map',
    //     plotType: 'MAP',
    //     filters: [],
    //     categories: ['latitude', 'longitude'],
    //     maxXTicks: -1,  // not used for map
    //     subCategories: ['error_code']
    //   },
    //   data: {}
    // }
  ],
  GNSS: [
    {
      id: 1,
      name: 'IPhone Simulation Status, Count per Spoofing Type',
      tableInfo: {
        log_name: 'r_awd_gnss_simulation_status_iphone',
        columns: [
          { column_name: 'day', column_type: 'Text' },
          { column_name: 'product', column_type: 'Text' },
          { column_name: 'buildtrain', column_type: 'Text' },
          { column_name: 'country', column_type: 'Text' },
          { column_name: 'ephemeris_file_injected', column_type: 'Float' },
          { column_name: 'cpi_assistance_provided', column_type: 'Float' },
          { column_name: 'display_on_avg', column_type: 'Float' },
          { column_name: 'reachableavg', column_type: 'Float' },
          { column_name: 'spoofing_type', column_type: 'Text' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_gnss_simulation_status_iphone',
        plotType: 'BAR',
        filters: [],
        categories: ['spoofing_type'],
        subCategories: [],
        sortBy: 'count',
        sortDirection: '<',
      },
      data: {}
    },
    {
      id: 2,
      name: 'Ephemeris usage, USA',
      tableInfo: {
        log_name: 'r_awd_gnss_ephemeris_usage',
        columns: [
          { column_name: 'day', column_type: 'Text' },
          { column_name: 'product', column_type: 'Text' },
          { column_name: 'buildtrain', column_type: 'Text' },
          { column_name: 'country', column_type: 'Text' },
          { column_name: 'ephemeris_file_injected', column_type: 'Float' },
          { column_name: 'reachableavg', column_type: 'Float' },
          { column_name: 'ephemeris_usage', column_type: 'Text' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_gnss_ephemeris_usage',
        plotType: 'BAR',
        filters: [{ key: 'country', operation: '=', values: ['United States'] }, { key: 'ephemeris_file_injected', operation: '=', values: [1] }],
        categories: ['ephemeris_usage'],
        subCategories: [],
        sortBy: 'count',
        sortDirection: '<',
      },
      data: {}
    },
    {
      id: 3,
      name: 'IPhone, USA, Count by Signal Environment',
      tableInfo: {
        log_name: 'r_awd_gnss_signal_env_iphone',
        columns: [
          { column_name: 'day', column_type: 'Text' },
          { column_name: 'product', column_type: 'Text' },
          { column_name: 'buildtrain', column_type: 'Text' },
          { column_name: 'country', column_type: 'Text' },
          { column_name: 'reachableavg', column_type: 'Float' },
          { column_name: 'signalenv', column_type: 'Text' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_gnss_signal_env_iphone',
        plotType: 'BAR',
        filters: [{ key: 'country', operation: '=', values: ['United States'] }],
        categories: ['signalenv'],
        subCategories: [],
        sortBy: 'count',
        sortDirection: '<',
      },
      data: {}
    },
    {
      id: 4,
      name: 'Watch, USA, Count by Signal Environment',
      tableInfo: {
        log_name: 'r_awd_gnss_signal_env_watch',
        columns: [
          { column_name: 'day', column_type: 'Text' },
          { column_name: 'product', column_type: 'Text' },
          { column_name: 'buildtrain', column_type: 'Text' },
          { column_name: 'country', column_type: 'Text' },
          { column_name: 'reachableavg', column_type: 'Float' },
          { column_name: 'signalenv', column_type: 'Text' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_gnss_signal_env_watch',
        plotType: 'BAR',
        filters: [{ key: 'country', operation: '=', values: ['United States'] }],
        categories: ['signalenv'],
        subCategories: [],
        sortBy: 'count',
        sortDirection: '<',
      },
      data: {}
    },
    {
      id: 5,
      name: 'IPhone RAT Type, Count by Signal Environment',
      tableInfo: {
        log_name: 'r_awd_gnss_signal_env_rattype_iphone',
        columns: [
          { column_name: 'day', column_type: 'Text' },
          { column_name: 'product', column_type: 'Text' },
          { column_name: 'buildtrain', column_type: 'Text' },
          { column_name: 'rattype', column_type: 'Text' },
          { column_name: 'reachableavg', column_type: 'Float' },
          { column_name: 'signalenv', column_type: 'Text' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_gnss_signal_env_rattype_iphone',
        plotType: 'BAR',
        filters: [],
        categories: ['signalenv'],
        subCategories: [],
        sortBy: 'count',
        sortDirection: '<',
      },
      data: {}
    },
    {
      id: 6,
      name: 'Spoofing by type map view - iPhone',
      tableInfo: {
        log_name: 'r_awd_gnss_spoofing_map_by_type_iphone',
        columns: [
          { column_name: 'day', column_type: 'Text' },
          { column_name: 'latitude_1degree', column_type: 'Float' },
          { column_name: 'longitude_1degree', column_type: 'Float' },
          { column_name: 'spoofing_type', column_type: 'Text' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_gnss_spoofing_map_by_type_iphone',
        plotType: 'MAP',
        filters: [],
        categories: ['latitude_1degree', 'longitude_1degree'],
        subCategories: ['spoofing_type']
      },
      data: {}
    },
    {
      id: 7,
      name: 'Spoofing map view - iPhone',
      tableInfo: {
        log_name: 'r_awd_gnss_spoofing_map_iphone',
        columns: [
          { column_name: 'day', column_type: 'Text' },
          { column_name: 'latitude_1degree', column_type: 'Float' },
          { column_name: 'longitude_1degree', column_type: 'Float' },
          { column_name: 'count', column_type: 'Bigint' },
        ]
      },
      settings: {
        logName: 'r_awd_gnss_spoofing_map_iphone',
        plotType: 'MAP',
        filters: [],
        categories: ['latitude_1degree', 'longitude_1degree'],
        subCategories: []
      },
      data: {}
    }
  ]
}

export const DATES = 'dates'
export const COUNT = 'count'
export const BAR = 'BAR'
export const LINE = 'LINE'
export const MAP = 'MAP'
export const PLOT_TYPES = [
  BAR,
  LINE,
]
