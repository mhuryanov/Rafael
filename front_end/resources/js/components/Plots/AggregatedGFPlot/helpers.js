import { CDF_TABLE, FITNESS_FEATURES, SUMMARY_TABLE } from "../../../utilities/constants"
import { addToObject, equalsCustomFilters, getPlacementType, isEmpty } from "../../../utilities/helpers"

const _ = require("underscore")

const BASE_OFFSET = 100

export const getDeviceCategory = (deviceType) => {
  switch (true) {
    case deviceType.startsWith("D1"):
      if (deviceType.startsWith("D10") || deviceType.startsWith("D11")) return "D10/D11"
      else return "D16/17"
    case deviceType.startsWith("D2"):
      if (deviceType.startsWith("D27") || deviceType.startsWith("D28")) return "D27/D28"
      else return "D20/D21/D22"
    case deviceType.startsWith("D3"):
      return "D3x"
    case deviceType.startsWith("D4"):
      if (deviceType.startsWith("D42") || deviceType.startsWith("D43")) return "D421/D431"
      else return "D49"
    case deviceType.startsWith("D5"):
      return "D5x"
    case deviceType.startsWith("D6"):
      return "D6x"
    case deviceType.startsWith("D7"):
      if (deviceType.startsWith("D73") || deviceType.startsWith("D74")) return "D73/D74"
      else return "D79"
    case deviceType.startsWith("N104"):
      return "N104"
    case deviceType.startsWith("N14"):
      return "N14x"
    case deviceType.startsWith("N15"):
      return "N15x"
    case deviceType.startsWith("N18"):
      return "N18x"
    case deviceType.startsWith("N841"):
      return "N841"
    default:
      return "Other"
  }
}

export const getPercentiles = (technology, feature) => {
  switch (true) {
    case technology === "GNSS":
      return [67, 95, 99]
    case technology === "E911":
      return [50, 80]
    default:
      return []
  }
}

export const getKpiColumns = (kpi) => {
  switch (kpi) {
    case "Percent of Error <":
      return ["percent_2m", "percent_3m", "percent_4m"]
    default:
      return ["percentiles"]
  }
}

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

const applyArchiveFilters = (archive, archiveFilters) => {
  const helper = (filterName) => {
    switch (filterName) {
      case "placement":
        return getPlacementType(archive.fieldtest_name)
      default:
        return ""
    }
  }
  let isValid = true
  Object.entries(archiveFilters).forEach(([filterName, filterValue]) => {
    if (helper(filterName) !== filterValue.toLowerCase()) {
      isValid = false
    }
  })
  return isValid
}

const colors = ["#FFA500", "#87CEEB", "#800080"]
const addToData = (data, label, dataPoint) => {
  const obj = _.find(data, element => {
    return element.name == label
  })
  if (isEmpty(obj)) {
    data.push({
      x: [],
      y: [],
      name: label,
      marker: {color: colors[data.length]},
      type: "box",
      boxpoints: "all",
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
      limit: null
    })
  }
  // BoxPlot
  let objBoxPlot = _.find(data, element => {
    return element.name == label
  })
  objBoxPlot.x.push(dataPoint?.name)
  objBoxPlot.y.push(dataPoint?.value)
  objBoxPlot.text.push(`<b>${label}</b><br><b>Value</b>: ${dataPoint?.value} <br><b>Device</b>: ${dataPoint?.archive?.device_serial_number}<br><b>Test Date</b>: ${dataPoint?.archive?.test_date}<br><b>Test Name</b>: ${dataPoint?.name}`)
  objBoxPlot.hovertemplate = "%{text}"
  objBoxPlot.archive = dataPoint?.archive
  objBoxPlot.limit = dataPoint?.limit
}

export const getAggregatedData = (
  archivesInfo,
  archives,
  customFilters = {},
  archiveFilters,
) => {
  const {
    valueColumn,
  } = SUMMARY_TABLE.CLX.GEOFENCING
  let plotlyData = []
  const deviceBuildTypes = {}
  const helper = (deviceType, buildTrain) => {
    let offset = 0
    const deviceBuildType = `${getDeviceCategory(deviceType)} ${buildTrain}`
    if (deviceBuildType in deviceBuildTypes) {
      offset += BASE_OFFSET * Object.keys(deviceBuildTypes).indexOf(deviceBuildType)
      deviceBuildTypes[deviceBuildType] += 1
    } else {
      offset += BASE_OFFSET * Object.keys(deviceBuildTypes).length
      deviceBuildTypes[deviceBuildType] = 1
    }
    return [offset, deviceBuildType]
  }

  archives
    .filter((archive) => applyArchiveFilters(archive, archiveFilters))
    .forEach((archive) => {
      const { id: archiveId, model_hardware: deviceType, build_train: buildTrain } = archive
      const archiveData = archivesInfo[archiveId]
      if (!isEmpty(archiveData)) {
        const values = archiveData[valueColumn]
        let kpilimit = undefined
        values.forEach((value, idx) => {
          const limitFilters = { ...customFilters }
          limitFilters.kpi = "PassCriteria"
          if (equalsCustomFilters(limitFilters, archiveData, idx)) {
            kpilimit = parseFloat(value)
          }
        })
        values.forEach((value, idx) => {
          if (equalsCustomFilters(customFilters, archiveData, idx)) {
            const [offset, deviceBuildType] = helper(deviceType, buildTrain)
            const subOffset = BASE_OFFSET / 2
            const label = customFilters.kpi
            const dataPoint = {
              name: deviceBuildType,
              placement: subOffset + offset,
              value: parseFloat(value),
              archive,
              label,
              limit: kpilimit,
            }
            addToData(plotlyData, label, dataPoint)
          }
        })
      }
    })
  const customFilterOptions = {
    fence_type: ["Fine", "Medium"],
    category: ["Entries", "Exits"],
    kpi: ["MaxFlaggingTime", "AverageFlaggingTime"],
  }
  plotlyData = updateXLabel(plotlyData)
  return [customFilterOptions, plotlyData]
}
const updateXLabel = (plotlyData) => {
  if (!plotlyData || plotlyData.length == 0)
    return
  plotlyData.forEach(element => {
    let xLabels = element?.x
    let newXLabels = []
    let counts = {}
    xLabels.forEach((x) => { counts[x] = (counts[x] || 0) + 1 })
    xLabels.forEach(x => {
      newXLabels.push(`${x}<br>(${counts[x]})`)
    })
    element.x = newXLabels
  })
  return plotlyData
}

export const getKpiCriteria = (technology, feature, category, kpiName, kpis, customFilters, archiveFilters) => {
  switch (true) {
    case technology === "GNSS":
      const { signal_env: signalEnv, source } = customFilters
      const { placement } = archiveFilters
      if (source === "WiFi" || category.toUpperCase().includes("UNCERTAINTY")) return {}
      if (["DRIVE", "ROOFTOP"].includes(feature)) {
        const [entryKpi] = kpis
          .filter((kpi) => {
            return (
              category.toUpperCase().includes(kpi.category.toUpperCase()) &&
              kpi.name.toUpperCase() === kpiName.toUpperCase() &&
              "environment" in kpi.meta &&
              kpi.meta.environment.toUpperCase() === signalEnv.toUpperCase() &&
              "placement" in kpi.meta &&
              kpi.meta.placement.toUpperCase() === placement.toUpperCase()
            )
          })
          .sort((a, b) => a.date < b.date)
        return entryKpi
      }
      if (feature === "TTFF") {
        const [entryKpi] = kpis
          .filter((kpi) => {
            return (
              category.toUpperCase().includes(kpi.category.toUpperCase()) &&
              (kpi.name.toUpperCase() === kpiName.toUpperCase() || kpi.name === "") &&
              "environment" in kpi.meta &&
              kpi.meta.environment.toUpperCase() === signalEnv.toUpperCase()
            )
          })
          .sort((a, b) => (a.date < b.date ? 1 : -1))
        return entryKpi
      }
      if (FITNESS_FEATURES.includes(feature)) {
        const fitnessEnv = signalEnv.toUpperCase() !== "UNKNOWN" ? signalEnv.toUpperCase() : "BENIGN"
        const [entryKpi] = kpis
          .filter((kpi) => {
            return (
              category.toUpperCase().includes(kpi.category.toUpperCase()) &&
              kpi.name.toUpperCase() === kpiName.toUpperCase() &&
              "environment" in kpi.meta &&
              kpi.meta.environment.toUpperCase() === fitnessEnv &&
              "placement" in kpi.meta &&
              kpi.meta.placement.toUpperCase() === "ARM_OR_HAND"
            )
          })
          .sort((a, b) => (a.date < b.date ? 1 : -1))
        return entryKpi
      }
    case technology === "E911":
      const categoryType = category.toUpperCase().includes("ALTITUDE") ? "ALTITUDE" : "HORIZONTAL"
      const [entryKpi] = kpis
        .filter((kpi) => {
          return (
            kpi.name.toUpperCase() === kpiName.replace(/ /g, "").toUpperCase() &&
            kpi.category.toUpperCase().includes(categoryType)
          )
        })
        .sort((a, b) => (a.date < b.date ? 1 : -1))
      return entryKpi
    default:
      return {}
  }
}

export const getCustomFilters = (technology, feature) => {
  switch (true) {
    case technology === "CLX" && feature === "GEOFENCING":
      return { fence_type: "Fine", category: "Entries", kpi: "MaxFlaggingTime" }
    default:
      return {}
  }
}

export const getArchiveFilters = (technology, feature) => {
  switch (true) {
    case technology === "GNSS" && ["DRIVE", "ROOFTOP"].includes(feature):
      return { placement: "mounted" }
    default:
      return {}
  }
}

export const getArchiveFilterOptions = (technology, feature, filterName) => {
  switch (true) {
    case technology === "GNSS" && ["DRIVE", "ROOFTOP"].includes(feature) && filterName === "placement":
      return ["mounted", "unmounted"]
    default:
      return []
  }
}
