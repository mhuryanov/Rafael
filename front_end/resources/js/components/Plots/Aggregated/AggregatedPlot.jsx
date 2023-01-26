import React, { useContext, useState } from "react"
import { Col, Row } from "react-bootstrap"
import { ContextMenu, MenuItem } from "react-contextmenu"
import { showMenu } from "react-contextmenu/modules/actions"
import { useHistory } from "react-router-dom"
import { KPI_NAMES } from "../../../utilities/constants"
import { isEmpty } from "../../../utilities/helpers"
import BoxPlot from "../PlotlySummaryBoxPlot"
import { FeatureContext } from "../../Pages/TechnologyPage/FeatureContext"
import { getKpiCriteria } from "./helpers"

const shortid = require("shortid")
const _ = require("underscore")

const RightClickOptions = ["Open", "Exclude", "DeepExclude"]
export const getMenuItemStyle = (menuItem) => {
  const getMenuItemColor = () => {
    switch (menuItem) {
      case "Open":
        return "CadetBlue"
      case "Exclude":
        return "pink"
      case "DeepExclude":
        return "red"
      default:
        return "grey"
    }
  }
  return { color: getMenuItemColor() }
}
export const getMenuIcon = (menuItem) => {
  switch (menuItem) {
    case "Open":
      return <>�</>
    case "Exclude":
      return <>⌫</>
    case "DeepExclude":
      return <>⌫</>
    default:
      return <>⃜</>
  }
}

export const getMenuItems = (selectedItem) => {
  if (!selectedItem) {
    return []
  }
  return RightClickOptions
}

const AggregatedPlot = ({
  technology,
  feature,
  plotlyData,
  category,
  yAxisRange = {},
  customFilters,
  archiveFilters,
  callbackAddExcluded
}) => {
  const { kpis } = useContext(FeatureContext)
  const history = useHistory()
  const [clickArchive, setClickArchive] = useState(null)

  const shapeLines = () => {
    let arr = []
    let textData = []

    plotlyData?.forEach((kpi) => {
      if (!kpi?.name)
        return
      const kpiCriteria = getKpiCriteria(
        technology,
        feature,
        KPI_NAMES[technology][category] || category,
        kpi?.name,
        kpis,
        customFilters,
        archiveFilters,
        kpi?.archive?.device_type || "iPhone",
      )
      if (!kpiCriteria) return null
      const { name, criteria = {} } = kpiCriteria
      const label = technology === "E911" ? "" : name
      const { target, nte } = criteria
      if (target) {
        const shapeLine = {
          type: "line",
          xref: "paper",
          x0: 0,
          y0: Number(target),
          x1: 1,
          y1: Number(target),
          opacity: ".75",
          line: {
            color: "green",
            width: 1,
            dash: "dot",
          },
          showlegend: false
        }
        const temp = {
          x: 1,
          y: Number(target),
          xref: "paper",
          yref: "y",
          text: `${label || "target"}`,
          showarrow: false,
          xanchor: "right",
          font: {
            size: 14,
            color: "green"
          },
          yanchor: "bottom"
        }
        textData.push(temp)
        arr.push(shapeLine)
      }
      if (nte) {
        const shapeLine = {
          type: "line",
          xref: "paper",
          x0: 0,
          y0: Number(nte),
          x1: 1,
          y1: Number(nte),
          opacity: ".75",
          line: {
            color: "red",
            width: 1,
            dash: "dot",
          },
          showlegend: false
        }
        const temp = {
          x: 0,
          y: Number(nte),
          xref: "paper",
          yref: "y",
          text: `${label || "nte"}`,
          showarrow: false,
          xanchor: "left",
          font: {
            size: 14,
            color: "red"
          },
          yanchor: "bottom"
        }
        textData.push(temp)
        arr.push(shapeLine)
      }
    })
    return { shapeline: arr, textData: textData }
  }

  const handleClick = ({ points, event }) => {
    if (points && points.length == 1) {
      showMenu({
        position: {
          x: event.pageX,
          y: event.pageY - document.documentElement.scrollTop,
        },
        target: {},
        id: "AggregatedPlotClickMenu",
      })
      setClickArchive(points[0]?.data?.archive || {})
    }
  }

  const handleClickMenu = (e, { menuItem }) => {
    switch (menuItem) {
      case "Open": {
        if (clickArchive && !isEmpty(clickArchive)) {
          const { test_date, fieldtest_name, fieldtest } = clickArchive
          if (technology !== "E911") {
            const doRedirect = confirm(`Go to the report for ${fieldtest_name} (${test_date})?`)
            if (doRedirect) history.push(`/technology/${technology}/${feature}/report/${fieldtest}`)
          } else {
            const doRedirect = confirm(`Go to the report for ${test_date}?`)
            if (doRedirect) history.push(`/technology/${technology}/${feature}/report/q?testDate=${test_date}`)
          }
        }
        break
      }
      case "Exclude": {
        callbackAddExcluded(clickArchive.id, false)
        setClickArchive(null)
        break
      }
      case "DeepExclude": {
        callbackAddExcluded(clickArchive.id, true)
        setClickArchive(null)
        break
      }
      default:
        break
    }
  }

  return (
    <>
      <>
        <BoxPlot
          data={plotlyData}
          yAxisRange={yAxisRange}
          yLabel={`${KPI_NAMES[technology][category] || category}`}
          handleClick={handleClick}
          onClick={(item, i, e) => {
            e.persist()
            handleClick(item, e)
          }}
          shapeLines={shapeLines()}
        />
      </>
      <ContextMenu id="AggregatedPlotClickMenu">
        {getMenuItems(clickArchive).map((menuItem) => (
          <MenuItem data={{ menuItem }} onClick={handleClickMenu} key={shortid.generate()}>
            <Row key={shortid.generate()}>
              <Col style={getMenuItemStyle(menuItem)}>{getMenuIcon(menuItem)}</Col>
              <Col>{menuItem}</Col>
            </Row>
          </MenuItem>
        ))}
      </ContextMenu>
    </>
  )
}

export default React.memo(AggregatedPlot)