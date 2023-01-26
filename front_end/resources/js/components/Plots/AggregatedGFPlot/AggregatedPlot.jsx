import React from "react"
import { useHistory } from "react-router-dom"
import { KPI_NAMES } from "../../../utilities/constants"
import BoxPlot from "../PlotlySummaryBoxPlot"

const AggregatedPlot = ({ technology, feature, plotlyData, category, yAxisRange = {} }) => {
  const history = useHistory()

  const handleClick = ({ points }) => {
    if (points && points.length == 1) {
      const { test_date, fieldtest_name, fieldtest } = points[0]?.data?.archive
      if (technology !== "E911") {
        const doRedirect = confirm(`Go to the report for ${fieldtest_name} (${test_date})?`)
        if (doRedirect) history.push(`/technology/${technology}/${feature}/report/${fieldtest}`)
      } else {
        const doRedirect = confirm(`Go to the report for ${test_date}?`)
        if (doRedirect) history.push(`/technology/${technology}/${feature}/report/q?testDate=${test_date}`)
      }
    }
  }

  const shapeLines = () => {
    let arr = []
    if (plotlyData && plotlyData.length == 0) return arr
    let textData = []
    plotlyData.forEach((element) => {
      const line = element?.limit
      if (!line) return
      const shapeLine = {
        type: "line",
        xref: "paper",
        x0: 0,
        y0: Number(line),
        x1: 1,
        y1: Number(line),
        opacity: ".75",
        line: {
          color: "rgb(255, 0, 0)",
          width: 2,
          dash: "dot",
        },
        showlegend: false,
      }
      const temp = {
        x: 0,
        y: Number(line),
        xref: "paper",
        yref: "y",
        text: `pass criteria: ${Number(line)}`,
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
    })
    return { shapeline: arr, textData: textData }
  }

  console.log("Rendering AggregatedPlotGF")
  return (
    <>
      <BoxPlot
        data={plotlyData}
        yAxisRange={yAxisRange}
        yLabel={`${KPI_NAMES[technology][category] || category}`}
        handleClick={handleClick}
        shapeLines={shapeLines()}
        filterReferenceLine={false}
      />
    </>
  )
}

export default React.memo(AggregatedPlot)
