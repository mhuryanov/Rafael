import { 
  SUMMARY_TABLE, 
  FITNESS_FEATURES, 
  CTP, CTP_REPORT_TABLE, 
  L5, L5_STATS_TABLE, 
  NMEA, NMEA_SUMMRAY_TABLE,
  SAL3,
} from '../../../utilities/constants'

export const getSummaryInfo = (technology, feature, reportType) => {
  switch (true) {
    case reportType === L5:
      return { ...L5_STATS_TABLE, tableName: `r_${technology.toLowerCase()}_${feature.toLowerCase()}_l5_antenna_stats` }
    case reportType === CTP:
      return { ...CTP_REPORT_TABLE, tableName: `r_${technology.toLowerCase()}_${feature.toLowerCase()}_ctp_summary` }
    case reportType === NMEA:
      return { ...NMEA_SUMMRAY_TABLE, tableName: `r_${technology.toLowerCase()}_${feature.toLowerCase()}_nmea_cno_ui_summary` }
    case technology === 'E911':
      return SUMMARY_TABLE[technology].ZAXIS
    case technology === 'GNSS' && FITNESS_FEATURES.includes(feature):
      const summaryInfo = JSON.parse(JSON.stringify(SUMMARY_TABLE[technology].DRIVE))
      summaryInfo.tableName = `r_gnss_${feature.toLowerCase()}_k_ui_summary`
      return summaryInfo
    case reportType === SAL3:
      return SUMMARY_TABLE["CLX"][SAL3]
    case feature === 'CHEESECAKE':
      return SUMMARY_TABLE["CLX"]['CHEESECAKE']
    default:
      return (
        (technology in SUMMARY_TABLE && feature in SUMMARY_TABLE[technology])
          ? SUMMARY_TABLE[technology][feature]
          : {}
      )
  }
}

export const colorMap = {
  green: 'lightgreen',
  red: 'rgb(255, 159, 159)',
  yellow: 'rgb(255, 235, 121)',
  purple: 'purple',
  orange: 'orange'
}

export const getColorStyle = (color) => {
  if (color) {
    return {
      marginLeft: '1px',
      marginRight: '1px',
      marginTop: '-3px',
      marginBottom: '-3px',
      paddingLeft: '5px',
      paddingRight: '5px',
      paddingTop: '3px',
      paddingBottom: '3px',
      borderRadius: '5px',
      backgroundColor: colorMap[color] || color,
      display: 'inline-block',
      color: 'black',
      fontWeight: '500',
      fontSize: '14px'
    }
  }
  return {}
}
