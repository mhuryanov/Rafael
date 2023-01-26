import { CDF_TABLE, FITNESS_FEATURES, KPI_L3_SUMMARY_TABLE } from "../../../utilities/constants"
import { addToObject, equalsCustomFilters, getPlacementType, isEmpty } from "../../../utilities/helpers"

const _ = require("underscore")

const BASE_OFFSET = 100

export const getKpiName = (kpiColumn) => {
  switch (true) {
    case kpiColumn.includes("percent_"):
      return `< ${kpiColumn.split("_")[1]}`
    default:
      return kpiColumn
  }
}

export const getCdfTable = (technology, feature) => {
  switch (true) {
    case technology === "GNSS" && (FITNESS_FEATURES.includes(feature) || ["ROOFTOP"].includes(feature)):
      const cdfInfo = JSON.parse(JSON.stringify(CDF_TABLE[technology].DRIVE))
      cdfInfo.tableName = `r_gnss_${feature.toLowerCase()}_k_ui_cdf`
      return cdfInfo
    case technology === "E911":
      return CDF_TABLE[technology].SESSION
    default:
      return technology in CDF_TABLE && feature in CDF_TABLE[technology] ? CDF_TABLE[technology][feature] : {}
  }
}

const colors = ["#FFA500", "#87CEEB", "#800080"]
const addToData = (data, label, dataPoint, customFilters) => {
  const obj = _.find(data, element => {
    return element.name == label
  })
  if (isEmpty(obj)) {
    data.push({
      x: [],
      y: [],
      name: label,
      marker: {color: "#FFA500"},
      type: "box",
      jitter: 0.0,
      whiskerwidth: 0.2,
      fillcolor: "cls",
      line: {
        width: 1
      },
      hovertemplate: "",
      hoverlabel: {
        bgcolor: "white",
        font:  {
          size: 18
        }
      },
      text: [],
      hoverinfo: "y",
      archive: {},
      limit: null,
      boxpoints: 'suspectedoutliers'
    })
  }
  // BoxPlot
  let objBoxPlot = _.find(data, element => {
    return element.name == label
  })
  objBoxPlot.x.push(dataPoint?.fence_name)
  if (customFilters?.kpi == "Time Latency")
    objBoxPlot.y.push(dataPoint?.time_latency?.value)
  else
    objBoxPlot.y.push(dataPoint?.distance_from_center?.value)
  objBoxPlot.text.push(`<b>${label}</b><br><b>Value</b>: ${dataPoint?.distance_from_center} <br><b>Device</b>: ${dataPoint?.archive?.device_serial_number}<br><b>Test Date</b>: ${dataPoint?.archive?.test_date}<br><b>Test Name</b>: ${dataPoint?.fence_name}`)
  objBoxPlot.hovertemplate = "%{text}"
  objBoxPlot.archive = dataPoint?.archive
}

export const getAggregatedData = (
  archivesInfo,
  archives,
  customFilters = {},
) => {
  const {
    categoryColumn,
    valueColumn,
    unitColumn
  } = KPI_L3_SUMMARY_TABLE.CLX.GEOFENCING
  let plotlyData = []

  archives
    .forEach((archive) => {
      const { id: archiveId, model_hardware: deviceType, build_train: buildTrain } = archive
      const archiveData = archivesInfo[archiveId]
      if (!isEmpty(archiveData)) {
        const categories = archiveData[categoryColumn]
        let data = {}
        categories?.forEach((category, idx) => {
          if (!data[category])
            data[category] = []
          if (archiveData[unitColumn][idx] && archiveData[unitColumn][idx] != "")
            data[category].push({ value:  archiveData[valueColumn][idx], unit: archiveData[unitColumn][idx]})
          else
            data[category].push(archiveData[valueColumn][idx])
        })

        const keys = Object.keys(data)
        data[keys[0]].forEach((element, idx) => {
          let dataPoint = {archive}
          keys?.forEach(key => {
            dataPoint[key] = data[key][idx]
          })
          if (equalCustomFilter(customFilters, dataPoint))
            addToData(plotlyData, dataPoint?.fence_name, dataPoint, customFilters)
        })
      }
    })

  const customFilterOptions = {
    status: ["Inside", "Outside"],
    kpi: ["Time Latency", "Distance from Fence Center"]
  }
  return [customFilterOptions, plotlyData]
}

const equalCustomFilter = (customFilters, dataPoint) => {
  if (dataPoint?.status == customFilters?.status)
    return true
  else
    return false
}

export const getCustomFilters = (technology, feature) => {
  switch (true) {
    case technology === "CLX" && feature === "GEOFENCING":
      return { type: "Inside", kpi: "" }
    default:
      return {}
  }
}
