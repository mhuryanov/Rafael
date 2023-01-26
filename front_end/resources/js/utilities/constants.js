module.exports = Object.freeze({
  SUBMITTED_FILE_NAME: "ROOT.zip",
  FIELDTEST_API: "/api/v0.01/fieldtest/",
  ARCHIVE_API: "/api/v0.01/archive/",
  FIELDTEST_ARCHIVE_SHARED_API: "/api/v0.01/fieldtestarchiveshared/",
  ARCHIVE_FETCH_LOGS_API: "/api/v0.01/archive/logs/",
  GROUP_ACCESS_API: "/api/v0.01/group_access/",
  ARCHIVE_FILTER_QUERY: "/api/v0.01/archive/query/",
  FILTER_ARCHIVE_DISTINCT: "/api/v0.01/webapi/archive_filters/",
  TAGS_API: "/api/v0.01/webapi/distinct/tags/",
  ARCHIVE_META_API: "/api/v0.01/meta/archive/",
  FIELDTEST_META_API: "/api/v0.01/meta/fieldtest/",
  TESTDATE_API: "/api/v0.01/webapi/testdates/",
  TECHNOLOGY_API: "/api/v0.01/webapi/technologies/",
  TECHNOLOGY_INFO_API: "/api/v0.01/technology/",
  CHANGE_PIPELINE_ARCHIVE: "/api/v0.01/archive/pipeline_bulk_update/",
  CHANGE_PIPELINE_FIELDTEST: "/api/v0.01/archive/pipeline_bulk_update/",
  PIPELINE_STATES_API: "api/v0.01/pipelinestate/",
  ARCHIVE_REPORTING_LOGS: "/api/v0.01/cassandraio/processed_logs/",
  CUSTOM_LOGS: "/api/v0.01/cassandraio/all_custom_logs/",
  ZAXIS_API: "/api/v0.01/zaxis",
  USER_API: "/api/v0.01/user/",
  ERROR_API: "/api/v0.01/errors/frontend/",
  TABLE_API: "/api/v0.01/table/",
  TABLE_MAPPING_API: "/api/v0.01/table_mapping/",
  KPI_MAPPING_API: "/api/v0.01/kpi_mapping/",
  LIVABILITY_API: "/api/v0.01/livability/",
  SCHEDULER_API: "/api/v0.01/scheduler_manager/",
  TAG_RULES_API: "/api/v0.01/tag_rule",
  JOBS_API: "/api/v0.01/jobs/",
  ARCHIVE_TYPES_API: "/api/v0.01/archivetype/",
  STORAGE_API: "/api/v0.01/storage_services/",
  CREDENTIALS_API: "/api/v0.01/credentials/",
  ARCHIVE_MAPPING: {
    archive: null,
    technology: "fieldtests_technology.name",
    feature: "fieldtests_feature.name",
    test_date: "fieldtests_fieldtest.test_date",
    fieldtest: "fieldtests_fieldtest.id",
    build_train: "fieldtests_archive.build_train",
    build_version: "fieldtests_archive.build_version",
    model_hardware: "fieldtests_archive.model_hardware",
    device_ecid: "fieldtests_archive.device_ecid",
    device_serial_number: "fieldtests_archive.device_serial_number",
    device_type: "fieldtests_archive.device_type",
    archive_type: "fieldtests_archivetype.name",
    archive_id: "fieldtests_archive.id",
    pipelinestate: "fieldtests_pipelinestate.name",
  },
  KPI_NAMES: {
    GNSS: {
      h_err: "Horizontal Error (m)",
      accuracy: "Horizontal Uncertainty (m)",
      v_err: "Altitude Error (m)",
      altitude_accuracy: "Altitude Uncertainty (m)",
      sp_err: "Speed Error (m/s)",
      c_err: "Course Error (deg)",
      along_error: "Along Error (m)",
      c_err_uncertainty_ratio: "Course Error Uncertainty Ratio",
      cross_error: "Cross Error (m)",
      h_err_uncertainty_ratio: "Horiztonal Error Uncertainty Ratio",
      sp_err_uncertainty_ratio: "Speed Error Uncertainty Ratio",
      system_processing_time: "System Processing Time (s)",
      time_between_fix: "Time Between Fix (s)",
      v_err_uncertainty_ratio: "Altitude Error Uncertainty Ratio",
    },
    CLX: {
      AverageFlaggingTime: "Average Flagging Time (s)",
      Flagged: "Flagged (%)",
      Yield: "Yield (%)",
      MaxFlaggingTime: "Max Flagging Time (s)",
      PassCriteria: "Pass Criteria (≤)",
      DriveDuration: "Drive Duration (s)",
      NumberOfWakes: "Number of Wakes",
      WakeDuration: "Wake Duration (s)",
      WakesRatio: "Wakes Ratio (%)",
      percent: "%",
      status: "Type",
      kpi: "KPI"
    },
    NMEA: {
      cno: {
        L1: "GPS L1 CNo (dB-Hz)",
        L5: "GPS L5 CNo (dB-Hz)",
        G1: "GLO G1 CNo (dB-Hz)",
        G2: "GLO G2 CNo (dB-Hz)",
        B1: "BDS B1 CNo (dB-Hz)",
        B2a: "BDS B2a CNo (dB-Hz)",
        E1: "GAL E1 CNo (dB-Hz)",
        E5a: "GAL E5a CNo (dB-Hz)",
      },
      sv_tracked: {
        L1: "GPS L1 SV Tracked",
        L5: "GPS L5 SV Tracked",
        G1: "GLO G1 SV Tracked",
        G2: "GLO G2 SV Tracked",
        B1: "BDS B1 SV Tracked",
        B2a: "BDS B2a SV Tracked",
        E1: "GAL E1 SV Tracked",
        E5a: "GAL E5a SV Tracked",
      },
      sv_used: {
        L1: "GPS L1 SV Used",
        L5: "GPS L5 SV Used",
        G1: "GLO G1 SV Used",
        G2: "GLO G2 SV Used",
        B1: "BDS B1 SV Used",
        B2a: "BDS B2a SV Used",
        E1: "GAL E1 SV Used",
        E5a: "GAL E5a SV Used",
      },
    },
    E911: {},
  },
  GROUP_BY_SELECTIONS: ["archive", "test_date", "fieldtest", "build_train", "build_version", "model_hardware"],
  DEFAULT_TECHNOLOGY: "GNSS",
  SUMMARY_TABLE: {
    GNSS: {
      DRIVE: {
        tableName: "r_gnss_drive_k_ui_summary",
        sourceColumn: "source",
        tableNameColumn: "table_name",
        kpiColumn: "kpi",
        categoryColumn: "category",
        segmentColumn: "segment",
        signalColumn: "signal_env",
        valueColumn: "value",
        unitColumn: "unit",
        colorColumn: "color",
      },
      TTFF: {
        tableName: "r_gnss_ttff_k_ui_summary",
        segmentColumn: "segment",
        sourceColumn: "source",
        tableNameColumn: "table_name",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
    },
    BA: {
      LKL: {
        tableName: "r_ba_lkl_results",
        tableNameColumn: "table_name",
        itemsColumn: "items",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
        tabColumn: "tab",
      },
      OFFLINEFINDING: {
        tableName: "r_ba_offlinefinding_level_two",
        tableNameColumn: "table_name",
        itemsColumn: "items",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
    },
    CLX: {
      GEOFENCING: {
        tableName: "r_clx_geofencing_kpi",
        itemsColumn: "fence_type",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
      WSB: {
        tableName: "r_clx_wsb_summary_tables",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
      TRENDS: {
        tableName: "r_clx_trends_summary",
        tableNameColumn: "job",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
      SEPARATIONALERTS: {
        tableName: "r_clx_sa_kpi_summary",
        itemsColumn: "items",
        tableNameColumn: "table_name",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
      SA_L3: {
        tableName: "r_clx_sa_detection_details",
        itemsColumn: "items",
        tableNameColumn: "table_name",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
      UNWANTEDTRACKING: {
        tableName: "r_clx_detection_stats",
        itemsColumn: "items",
        tableNameColumn: "table_name",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
      UT_L3: {
        tableName: "r_clx_all_detection_summary",
        itemsColumn: "items",
        tableNameColumn: "table_name",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
      MICROLOCATIONS: {
        tableName: "r_clx_microlocations_summary",
        itemsColumn: "microlocation",
        tableNameColumn: "table_name",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
      CHEESECAKE: {
        tableName: "r_clx_cheesecake_summary",
        itemsColumn: "items",
        tableNameColumn: "test",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        firstHeader: ["TEST", "HW_Model"]
      },
    },
    E911: {
      SCANNER: {
        tableName: "e911_logstitch_results",
        callColumn: "call_session",
        kpiColumn: "scanner",
        valueColumn: "verdict",
        scannerColumn: "scanner_detail",
      },
      ZAXIS: {
        tableName: "e911_summary",
        sourceColumn: "source",
        tableNameColumn: "table_name",
        categoryColumn: "category",
        kpiColumn: "kpi",
        valueColumn: "value",
        unitColumn: "unit",
        colorColumn: "color",
      },
      SESSION: {
        tableName: "e911_call_sessions",
        categoryColumn: "category",
        tableNameColumn: "table_name",
        vErrorColumn: "ve",
        vUncertaintyColumn: "vepunc",
        hErrorColumn: "he",
        hUncertaintyColumn: "hepunc",
      },
    },
    R1: {
      FINDMY: {
        tableName: "r_r1_findmy_summary_table_bar",
        plotNameColumn: "bar_plot_name",
        tableNameColumn: "table_name",
        itemsColumn: "items",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
      FINDBTRSSI: {
        tableName: "r_r1_findbtrssi_summary_table_bar",
        plotNameColumn: "bar_plot_name",
        tableNameColumn: "table_name",
        itemsColumn: "items",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
    },
    ROUTINE: {
      SLV: {
        tableName: "r_routine_slv_summary",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
      LOIPROVIDER: {
        tableName: "r_routine_lp_summary",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
    },
    REPLAY: {
      NEARBYD: {
        tableName: "r_replay_nearbyd_summary_table",
        tableNameColumn: "table_name",
        itemsColumn: "item",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
      MICROLOCATION: {
        tableName: "r_replay_microlocation_perf_test_pass_trends",
        itemsColumn: "microlocation",
        tableNameColumn: "table_name",
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
    },
  },
  CDF_TABLE: {
    GNSS: {
      DRIVE: {
        tableName: "r_gnss_drive_k_ui_cdf",
        kpiColumn: "kpi_name",
        percentColumn: "percentiles",
        segmentColumn: "segment",
        signalColumn: "signal_env",
        sourceColumn: "source",
      },
      TTFF: {
        tableName: "r_gnss_ttff_k_ui_cdf",
        sourceColumn: "source",
        tableNameColumn: "table_name",
        kpiColumn: "kpi_name",
        percentColumn: "percentiles",
        segmentColumn: "segment",
        signalColumn: "signal_env",
      },
    },
    E911: {
      ZAXIS: {
        tableName: "e911_cdf",
        kpiColumn: "category",
        percentColumn: "percentiles",
        sourceColumn: "source",
        tableNameColumn: "table_name",
      },
      SESSION: {
        tableName: "e911_call_sessions_cdf",
        kpiColumn: "category",
        percentColumn: "percentiles",
        tableNameColumn: "table_name",
      },
    },
    NMEA: {
      tableName: "r_gnss_drive_nmea_cno_cdf_plot",
      tableNameColumn: "constellation",
      kpiColumn: "frequency",
      percentColumn: "percentiles",
      segmentColumn: "segment",
      signalColumn: "signal_env",
    },
    BA: {
      OFFLINEFINDING: {
        tableName: "r_ba_offlinefinding_cdfs",
        tableNameColumn: "table_name",
        kpiColumn: "kpi_name",
        percentColumn: "percentiles",
        columns: ["table_name", "kpi_name", "percentiles", "source"],
      },
    },
    REPLAY: {
      NEARBYD: {
        tableName: "r_replay_nearbyd_cdf_plot_table",
        tableNameColumn: "table_name",
        itemColumn: "item",
        kpiColumn: "category",
        percentColumn: "percentile",
        columns: ["item", "category", "percentile"],
      },
    },
  },
  KPI_TABLE: {
    CLX: {
      GEOFENCING: {
        tableName: "r_clx_geofencing_timeplot",
        columns: ["log_timestamp", "table_name", "fence_name", "label", "double_value", "enum_value", "description"],
      },
      WSB: {
        tableName: "r_clx_wsb_graphs",
        columns: ["x_axis", "table_name", "point_name", "label", "double_value", "enum_value", "ios_time"],
      },
      TRENDS: {
        tableName: "r_clx_trends_status_test",
        columns: ["info_date", "job", "enum_value", "job", "double_value", "enum_value", "description", "color"], // enum_value also used for series name, job used for plot name and label
      },
      SEPARATIONALERTS: {
        tableName: "r_clx_sa_time_series",
        columns: ["x_axis", "table_name", "series_name", "label", "double_value", "enum_value", "description"],
      },
      MICROLOCATIONS: {
        tableName: "r_clx_microlocations_level3",
        columns: ["log_timestamp", "table_name", "data_name", "label", "double_value", "enum_value", "description"],
      },
      CHEESECAKE: {
        tableName: "r_clx_cheesecake_trends",
        // columns: ["log_timestamp", "table_name", "data_name", "label", "double_value", "enum_value", "description"],
        columns: ["date", "test", "result", "test", "row_index", "result", "model", "build_ver"], // row index is the row in which the plot is displayed
      },
    },
    GNSS: {
      DRIVE: {
        tableName: "r_gnss_drive_k_ui_level3",
        columns: ["ios_time", "source", "segment"],
      },
      TTFF: {
        tableName: "r_gnss_ttff_k_ui_level3",
        columns: ["ios_time", "table_name", "iteration_name", "label", "double_value", "enum_value", "description"],
      },
    },
    NMEA: {
      columns: ["segment", "constellation", "frequency", "max_four_cno_avg", "ios_time"],
    },
    E911: {
      tableName: "e911_timeplot",
      columns: ["source", "plot_name", "category", "double_value", "ios_time"],
    },
    R1: {
      OR: {
        tableName: "r_r1_or_session_result",
        columns: ["ios_time", "log_timestamp", "sess_config", "range", "rssi", "yield"],
      },
    },
    ROUTINE: {
      LOIPROVIDER: {
        tableName: "r_routine_lp_fix_type_ts",
        columns: [
          "log_timestamp",
          "plot_name",
          "series_name",
          "label",
          "double_value",
          "enum_value",
          "description",
          "color",
        ],
      },
    },
    REPLAY: {
      MICROLOCATION: {
        tableName: "r_replay_microlocation_perf_test_pass_trends",
        columns: ["date", "tech_config", "test_pass", "tech_config", "row_index", "test_pass", "description", "color"], // row index is the row in which the plot is displayed
      },
    },
  },
  KPI_L3_SUMMARY_TABLE: {
    ROUTINE: {
      SLV: {
        tableName: "r_routine_slv_level3",
        columns: ["table_name", "category", "value", "unit"],
      },
      LOIPROVIDER: {
        tableName: "r_routine_lp_level3",
        columns: ["table_name", "category", "value", "unit"],
      },
    },
    CLX: {
      GEOFENCING: {
        tableName: "r_clx_geofencing_notification_details",
        columns: { tableCol: "table_name", categoryCol: "category", valueCol: "value", unitCol: "unit" },
        categoryColumn: "category",
        kpiColumn: "kpi",
        unitColumn: "unit",
        valueColumn: "value",
        colorColumn: "color",
      },
    },
  },
  PLOT_TABLE: {
    R1: {
      FINDBTRSSI: {
        tableName: "r_r1_findbtrssi_level3_plot",
        tableNameColumn: "plot_name",
        xColumn: "iteration",
        serieColumn: "serie_name",
        valueColumn: "double_value",
        descriptionColumn: "description",
        columns: ["plot_name", "iteration", "serie_name", "double_value"],
      },
    },
  },
  MAP_TABLE: {
    CLX: {
      GEOFENCING: {
        tableName: "r_clx_geofencing_map_json",
      },
      WSB: {
        tableName: "r_clx_wsb_map_geojson",
      },
      SEPARATIONALERTS: {
        tableName: "r_clx_sa_map_json",
      },
    },
    ROUTINE: {
      SLV: {
        tableName: "r_routine_slv_map_json",
      },
      LOIPROVIDER: {
        tableName: "r_routine_lp_map_json",
      },
    },
    BA: {
      OFFLINEFINDING: {
        tableName: "r_ba_offlinefinding_geojson",
      },
    },
  },
  TRUTH_TABLE: {
    R1: {
      OR: {
        tableName: "r1_or_truth",
        responderColumn: "responder_orientation",
        initiatorColumn: "initiator_orientation",
        continuousColumn: "continuous_operation_range",
        intermittentColumn: "intermittent_operation_range",
      },
    },
  },
  DEFAULT_KPIS: {
    GNSS: ["h_err", "v_err", "sp_err", "c_err"],
    CLX: [
      "AverageFlaggingTime",
      "Yield",
      "Flagged",
      "MaxFlaggingTime",
      "Pass",
      "PassCriteria",
      "DriveDuration",
      "NumberOfWakes",
      "WakeDuration",
      "WakesRatio",
    ],
  },
  YEAR_IN_DAYS: 365,
  MONTH_IN_DAYS: 31,
  WEEK_IN_DAYS: 7,
  DAY_IN_DAYS: 1,
  DATE_RANGE_MAPPING: {
    1: "Today",
    7: "Last Week",
    14: "Last 2 Weeks",
    28: "Last 4 Weeks",
    31: "Last Month",
    365: "Last Year",
    null: "All Time",
  },
  DAY_IN_MILLISECONDS: 1000 * 60 * 60 * 24,
  ARCHIVE_COMPLETED_STATUS: "Processing__SUCCEEDED",
  ARCHIVE_START_STATUS: "UploadingArchive__Completed",
  DEFAULT_GROUP_BY: {
    GNSS: "test_date",
    CLX: "fieldtest",
    E911: "test_date",
  },
  TTFF_KPI_MAPPING: {
    "CL-GPSSA (Vendor)": {
      "GPS TTFF FFHE FFVE": {
        ttff_gpssa: "TTFF GPS (s)",
        h_err_gpssa: "Horizontal Error FF GPS (m)",
        v_err_gpssa: "Altitude Error FF GPS (m)",
      },
      "Horizontal Position Convergence": {
        h_err_5max_gpssa: "5s Horizontal Error Max (m)",
        h_err_10max_gpssa: "10s Horizontal Error Max (m)",
        h_err_20max_gpssa: "20s Horizontal Error Max (m)",
        h_err_60max_gpssa: "60s Horizontal Error Max (m)",
      },
      "Vertical Position Convergence": {
        v_err_5max_gpssa: "5s Altitude Error Max (m)",
        v_err_10max_gpssa: "10s Altitude Error Max (m)",
        v_err_20max_gpssa: "20s Altitude Error Max (m)",
        v_err_60max_gpssa: "60s Altitude Error Max (m)",
      },
      "Position Uncertainty": {
        h_uncertainty_gpssa: "FF Horizontal Position Uncertainty (m)",
        v_uncertainty_gpssa: "FF Altitude Position Uncertainty (m)",
      },
      "Uncertainty Ratio": {
        h_err_unc_ratio_gpssa: "Horizontal Error to Uncertainty (Ratio)",
        v_err_unc_ratio_gpssa: "Altitude Error to Uncertainty (Ratio)",
      },
    },
    "CL-Pos (All technology - Best)": {
      "All Tech TTFF FFHE FFVE": {
        ttff_clpos_all: "TTFF (s)",
        h_err_clpos_all: "Horizontal Error FF (m)",
        v_err_clpos_all: "Altitude Error FF (m)",
      },
    },
    "CL-Pos (Per Technology)": {
      "GPS TTFF FFHE FFVE": {
        ttff_clpos: "TTFF GPS (s)",
        h_err_clpos: "Horizontal Error FF GPS (m)",
        v_err_clpos: "Altitude Error FF GPS (m)",
      },
      "Horizontal Position Convergence": {
        h_err_5max_clpos: "5s Horizontal Error Max (m)",
        h_err_10max_clpos: "10s Horizontal Error Max (m)",
        h_err_20max_clpos: "20s Horizontal Error Max (m)",
        h_err_60max_clpos: "60s Horizontal Error Max (m)",
      },
      "Vertical Position Convergence": {
        v_err_5max_clpos: "5s Altitude Error Max (m)",
        v_err_10max_clpos: "10s Altitude Error Max (m)",
        v_err_20max_clpos: "20s Altitude Error Max (m)",
        v_err_60max_clpos: "60s Altitude Error Max (m)",
      },
      "Position Uncertainty": {
        h_uncertainty_clpos: "FF Horizontal Position Uncertainty (m)",
        v_uncertainty_clpos: "FF Altitude Position Uncertainty (m)",
      },
      "Uncertainty Ratio": {
        h_err_unc_ratio_clpos: "Horizontal Error to Uncertainty (Ratio)",
        v_err_unc_ratio_clpos: "Altitude Error to Uncertainty (Ratio)",
      },
      "WiFi Cell TTFF FFHE": {
        ttff_cell: "Cell TTFF (s)",
        h_err_cell_clpos: "Cell Horizontal Error (m)",
        ttff_wifi: "Wifi TTFF (s)",
        h_err_wifi_clpos: "Wifi Horiztonal Error (m)",
      },
      "Wifi To GPS Transition": {
        runtime: "RunTime (s)",
      },
    },
    "CL-Unfiltered (Raw fixes)": {
      "WiFi Cell TTFF FFHE": {
        ttff_cell: "Cell TTFF (s)",
        h_err_cell_cl_unfiltered: "Cell Horizontal Error (m)",
        ttff_wifi: "Wifi TTFF (s)",
        h_err_wifi_cl_unfiltered: "Wifi Horiztonal Error (m)",
      },
    },
  },
  TTFF_TABLE_MAPPING: {
    "All Tech TTFF FFHE FFVE": [
      "Samples",
      "Yield AllTech",
      "TTFF (s)",
      "Horizontal Error FF (m)",
      "Altitude Error FF (m)",
    ],
    "GPS TTFF FFHE FFVE": [
      "Samples",
      "Yield",
      "TTFF GPS (s)",
      "Horizontal Error FF GPS (m)",
      "Altitude Error FF GPS (m)",
      "Assistance",
    ],
    "Horizontal Position Convergence": [
      "5s Horizontal Error Max (m)",
      "10s Horizontal Error Max (m)",
      "20s Horizontal Error Max (m)",
      "60s Horizontal Error Max (m)",
    ],
    "Vertical Position Convergence": [
      "5s Altitude Error Max (m)",
      "10s Altitude Error Max (m)",
      "20s Altitude Error Max (m)",
      "60s Altitude Error Max (m)",
    ],
    "Position Uncertainty": [
      "Samples",
      "Yield",
      "FF Horizontal Position Uncertainty (m)",
      "FF Altitude Position Uncertainty (m)",
    ],
    "Uncertainty Ratio": [
      "Samples",
      "Yield",
      "Horizontal Error to Uncertainty (Ratio)",
      "Altitude Error to Uncertainty (Ratio)",
    ],
    "WiFi Cell TTFF FFHE": [
      "Samples",
      "Cell Yield",
      "Cell TTFF (s)",
      "Cell Horizontal Error (m)",
      "Wifi Yield",
      "Wifi TTFF (s)",
      "Wifi Horizontal Error (m)",
    ],
    "Wifi To GPS Transition": ["Samples", "Ignored-GPS-Warmup session count", "RunTime (s)"],
  },
  COLOR_ARRAY: [
    "#57D4C5",
    "#0000FF",
    "#FF8C00",
    "#00BFFF",
    "#9370DB",
    "#FFB425",
    "#DDA0DD",
    "#B308D3",
    "#00FFFF",
    "#A9A9A9",
    "#DEB887",
    "#C277C6",
    "#FFE4C4",
    "#238D85",
    "#8D6C2F",
    "#8B008B",
    "#2CA1AE",
    "#778899",
    "#51ADBD",
    "#4869D0",
    "#BA758A",
    "#004C60",
    "#983F7A",
    "#79352C",
    "#D3493A",
    "#0F525F",
    "#FB21A3",
    "#2F3F94",
    "#635F6D",
    "#C79ED2",
    "#996C48",
    "#1DEAA7",
    "#8798A4",
    "#FB4C03",
    "#C4FD57",
    "#2F1179",
    "#4CA2F9",
    "#EA9E70",
    "#6666FF",
    "#9900B3",
    "#99E6E6",
    "#E64D66",
    "#FF99E6",
  ],
  NO_PROCESSING: ["LIVABILITY", "AWD"],
  FITNESS_FEATURES: ["WALK", "RUN", "SWIM", "BIKE", "DAVIS", "TREADSTONE", "MARCOLITE", "MAPS377"],
  EXCLUDE_TECHNOLOGIES: ["DELETE"],
  COMPARE: {
    "<": (a, b) => (typeof b !== "string" ? Number(a) < Number(b) : a < b ? -1 : 1),
    ">": (a, b) => (typeof b !== "string" ? Number(a) > Number(b) : a > b ? -1 : 1),
    "=": (a, b) => (typeof b !== "string" ? Number(a) === Number(b) : a === b),
    "!=": (a, b) => (typeof b !== "string" ? Number(a) !== Number(b) : a !== b),
  },
  DEFAULT_REPORT_TYPE: "Performance",
  PERFORMANCE: "Performance",
  METRICS: "Metrics",
  CTP: "CTP",
  CTP_REPORT_TABLE: {
    tableNameColumn: "group",
    categoryColumn: "tc_name",
    kpiColumn: "tstt",
    verdictColumn: "verdict",
    descriptionColumn: "description",
  },
  CTP_LEVEL3_TABLE: {
    columns: ["log_timestamp", "plot_name", "flag", "line_label", "value", "enum_value", undefined, "table_name"], // table_name --> group name
  },
  L5: "L5",
  L5_EVENTPLOT_TABLE: {
    columns: ["log_timestamp", "plot_name", "event_name", "label", "double_value", "enum_value", "description"],
  },
  L5_STATS_TABLE: {
    tableNameColumn: "table_name",
    itemsColumn: "items",
    categoryColumn: "category",
    kpiColumn: "kpi",
    unitColumn: "unit",
    valueColumn: "value",
    colorColumn: "color",
  },
  NMEA: "NMEA",
  NMEA_SUMMRAY_TABLE: {
    itemsColumn: "frequency",
    kpiColumn: "kpi",
    categoryColumn: "category",
    segmentColumn: "segment",
    signalColumn: "signal_env",
    valueColumn: "value",
    unitColumn: "unit",
    colorColumn: "color",
  },
  DEFAULT_META_KEYS: ["Placement", "Carrier", "Comments"],
  SAL3: "SA_L3",
  UTL3: "UT_L3",
  TAGS_DEEPEXCLUDED: "DeepExcluded",
})
