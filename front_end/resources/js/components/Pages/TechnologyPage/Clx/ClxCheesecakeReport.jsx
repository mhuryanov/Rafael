/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import { Spinner } from "@tidbits/react-tidbits/Spinner"
import React, { Suspense, useEffect, useState } from "react"
import { Col, Row } from "react-bootstrap"
import { Redirect, useParams } from "react-router-dom"
import { useFetchArchiveDataQuery } from "../../../../hooks/fetchData"
import { CUSTOM_LOGS } from "../../../../utilities/constants"
import ClxCheesecakeSummaryTable from "../../../Tables/SummaryTable/ClxCheesecakeSummaryTable"
import HelpTooltip from "../../../Widgets/HelpTooltip"
import { FeatureProvider } from "../FeatureContext"

const _ = require("underscore")

const ClxCheesecakeReport = () => {
  const { technology: urlTechnology, feature: urlFeature, reportDate: reportDate } = useParams()
  const technology = urlTechnology.toUpperCase()
  const feature = urlFeature.toUpperCase()
  const errorMessage = null
  const archives = ["1f3c96c0-a17c-11ec-866c-6805ca5dd8e0"];
  const [reliabilityData, setReliabilityData] = useState(null);
  // const [scanReliabilityData, setScanReliabilityData] = useState(null);

  const [filters, setFilters] = useState({}) // reserved for future possible filters

  if (errorMessage) {
    return <Redirect to="/error" />
  }

  const createTimeRangeQueryString = (recentDate) => {
    const dateQuery = `test_date ='${recentDate}'`
    return dateQuery
  }

  const dateQuery = createTimeRangeQueryString(reportDate)
  const [isLoading, archivesInfo] = useFetchArchiveDataQuery(
    archives,
    CUSTOM_LOGS,
    "table_uuid",
    "1f3c96c0-a17c-11ec-866c-6805ca5dd8e0",
    "r_clx_cheesecake_summary",
    dateQuery,
  )

  useEffect(() => {
    if (!isLoading && archivesInfo) {
      // let reliabilityData = {
      //   category: [],
      //   items: [],
      //   kpi: [],
      //   row_index: [],
      //   test_date: [],
      //   unit: [],
      //   value: []
      // }
      const info = archivesInfo['1f3c96c0-a17c-11ec-866c-6805ca5dd8e0'];
      // const tests = info?.test;
      // tests?.forEach((element, idx) => {
      //   if (element == 'PlayReliability') {
      //     playReliability.category.push(info?.category[idx]);
      //     playReliability.items.push(info?.items[idx]);
      //     playReliability.kpi.push(info?.kpi[idx]);
      //     playReliability.row_index.push(info?.row_index[idx]);
      //     playReliability.test_date.push(info?.test_date[idx]);
      //     playReliability.unit.push(info?.unit[idx]);
      //     playReliability.value.push(info?.value[idx]);
      //   } else if (element == 'ScanReliability') {
      //     scanReliability.category.push(info?.category[idx]);
      //     scanReliability.items.push(info?.items[idx]);
      //     scanReliability.kpi.push(info?.kpi[idx]);
      //     scanReliability.row_index.push(info?.row_index[idx]);
      //     scanReliability.test_date.push(info?.test_date[idx]);
      //     scanReliability.unit.push(info?.unit[idx]);
      //     scanReliability.value.push(info?.value[idx]);
      //   }
      // });
      setReliabilityData(info);
    }
  }, [archivesInfo]);

  console.log("Rendering ClxCheeseCakeReport");

  return (
    <FeatureProvider technology={technology} feature={feature}>
      <Suspense
        fallback={
          <div className="spinner-gray">
            <Spinner visible />
          </div>
        }
      >
        <h1 className="dashboard-title">{`${reportDate}`}</h1>
        <Row>
          <Col className="box devicel3-table">
            <h1 className="plot-title" style={{ marginTop: "25px" }}>
              Play Reliability Report
            </h1>
            <Row className="justify-content-center zero-margin">
              <Suspense fallback={<Spinner visible />}>
                <ClxCheesecakeSummaryTable
                  feature={feature}
                  technology={technology}
                  filters={filters}
                  setFilters={setFilters}
                  archivesInfo={reliabilityData}
                />
              </Suspense>
            </Row>
          </Col>
        </Row>
        {/* <Row>
          <Col className="box devicel3-table">
            <h1 className="plot-title" style={{ marginTop: "25px" }}>
              Scan Reliability Report
            </h1>
            <Row className="justify-content-center zero-margin">
              <Suspense fallback={<Spinner visible />}>
                <ClxCheesecakeSummaryTable
                  feature={feature}
                  technology={technology}
                  filters={filters}
                  setFilters={setFilters}
                  archivesInfo={scanReliabilityData}
                />
              </Suspense>
            </Row>
          </Col>
        </Row> */}
      </Suspense>
    </FeatureProvider>
  )
}

export default React.memo(ClxCheesecakeReport)
