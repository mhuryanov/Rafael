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

  console.log("Rendering AggregatedPlotNTFY")
  return (
    <>
      <BoxPlot
        data={plotlyData}
        yAxisRange={yAxisRange}
        yLabel={`${KPI_NAMES[technology][category] || category}`}
        handleClick={handleClick}
        filterReferenceLine={false}
      />
    </>
  )
}

export default React.memo(AggregatedPlot)
