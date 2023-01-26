
/* eslint-disable react/prop-types */
import { Text } from "@tidbits/react-tidbits"
import React, { useContext, useEffect, useState } from "react"
import { Col, Row } from "react-bootstrap"
import { useFetchArchiveDataQuery } from "../../../../hooks/fetchData"
import { CUSTOM_LOGS, KPI_TABLE, SUMMARY_TABLE } from "../../../../utilities/constants"
import { addToObject, formatDateStamp, formatDateTimeStamp, getPreviousDate, isEmpty, setDefaultObject } from "../../../../utilities/helpers"
import Box from "../../../Box"
import TimeSeriesDailyStatus from "../../../Plots/TimeSeriesDailyStatus"
import TimeSeriesDailyStatusMetrics from "../../../Plots/TimeSeriesDailyStatusMetrics"
import HelpTooltip from "../../../Widgets/HelpTooltip"
import { StateContext } from "../../../StateContext"
import ClxCheesecakeDailyStatus from "../../../Plots/ClxCheesecakeDailyStatus"
const _ = require("underscore")

const getDateQuery = (startDate, endDate) => {
  let dateQuery = ""
  dateQuery = startDate ? `test_date>='${startDate}'` : dateQuery
  dateQuery = endDate ? `test_date<='${endDate}'` : dateQuery
  dateQuery = startDate && endDate ? `test_date>='${startDate}' and test_date<='${endDate}'` : dateQuery
  return dateQuery
}

const transformData = (data) => {
  if (data == null) return null;
  data = data['c2a9790e-5e38-11ec-8961-6805ca5f08d8'];
  let playReliabilityData = null;
  let scanReliabilityData = null;
  let playReliabilityTags = [];
  let scanReliabilityTags = [];
  data?.test?.forEach((element, idx) => {
    if (element.toLowerCase() == 'playreliability') {
      if (playReliabilityData == null) {
        playReliabilityData = {
          build_ver: [],
          model: [],
          result: [],
          row_index: [],
          tag_hw: [],
          tag_hw_index: [],
          test_date: []
        };
      }
      playReliabilityData.build_ver.push(data?.build_ver[idx]);
      playReliabilityData.model.push(data?.model[idx]);
      playReliabilityData.result.push(data?.result[idx]);
      playReliabilityData.row_index.push(data?.row_index[idx]);
      playReliabilityData.tag_hw.push(data?.tag_hw[idx]);
      let index = playReliabilityTags.indexOf(data?.tag_hw[idx])
      if (index == -1) {
        playReliabilityTags.push(data?.tag_hw[idx]);
        index = playReliabilityTags.indexOf(data?.tag_hw[idx])
      }
      playReliabilityData.tag_hw_index.push(index);
      playReliabilityData.test_date.push(data?.test_date[idx]);
    } else {
      if (scanReliabilityData == null) {
        scanReliabilityData = {
          build_ver: [],
          model: [],
          result: [],
          row_index: [],
          tag_hw: [],
          tag_hw_index: [],
          test_date: []
        };
      }
      scanReliabilityData.build_ver.push(data?.build_ver[idx]);
      scanReliabilityData.model.push(data?.model[idx]);
      scanReliabilityData.result.push(data?.result[idx]);
      scanReliabilityData.row_index.push(data?.row_index[idx]);
      scanReliabilityData.tag_hw.push(data?.tag_hw[idx]);
      let index = scanReliabilityTags.indexOf(data?.tag_hw[idx])
      if (index == -1) {
        scanReliabilityTags.push(data?.tag_hw[idx]);
        index = scanReliabilityTags.indexOf(data?.tag_hw[idx])
      }
      scanReliabilityData.tag_hw_index.push(index);
      scanReliabilityData.test_date.push(data?.test_date[idx]);
    }
  });
  return [playReliabilityData, scanReliabilityData, playReliabilityTags, scanReliabilityTags];
}

const ClxCheesecakeTrends = ({ technology, dateState, feature }) => {
  console.log("Rendering ClxCheesecakeTrends")
  let startDate = dateState["startDate"] ? dateState["startDate"].toISOString().split("T")[0] : undefined
  let endDate = dateState["endDate"] ? dateState["endDate"].toISOString().split("T")[0] : undefined
  const archives = ["c2a9790e-5e38-11ec-8961-6805ca5f08d8"]
  const dateQueryStartEnd = getDateQuery(startDate, endDate);
  const [archivesData, setArchivesData] = useState({playReliabilityData: null, scanReliabilityData: null, playReliabilityTags: [], scanReliabilityTags: []});
  const { playReliabilityData, scanReliabilityData, playReliabilityTags, scanReliabilityTags } = archivesData;

  const [isLoading, archivesInfo] = useFetchArchiveDataQuery(
    archives,
    CUSTOM_LOGS,
    "table_uuid",
    "c2a9790e-5e38-11ec-8961-6805ca5f08d8",
    KPI_TABLE.CLX.CHEESECAKE.tableName,
    dateQueryStartEnd,
  )

  useEffect(() => {
    if (archivesInfo) {
      const [newPlayReliabilityData, newScanReliabilityData, newPlayReliabilityTags, newScanReliabilityTags] = transformData(archivesInfo);
      setArchivesData({
        playReliabilityData: newPlayReliabilityData,
        scanReliabilityData: newScanReliabilityData,
        playReliabilityTags: newPlayReliabilityTags, scanReliabilityTags: newScanReliabilityTags
      });
    }
  }, [archivesInfo]);
  
  return (
    <>
      <Row>
        <Box
          title={
            <>
              Play Reliability
              <HelpTooltip title="Tips" content={<Text>Click and drag on plots to zoom</Text>} />
            </>
          }
          isLoading={isLoading}
          type="report-plot"
        >
            {!isEmpty(playReliabilityData) && (
            <Col>
              <ClxCheesecakeDailyStatus 
                loadedData={playReliabilityData}
                technology={technology}
                feature={feature}
                tags={playReliabilityTags}
              />
            </Col>
          )}
        </Box>
        <Box
          title={
            <>
              Scan Reliability
              <HelpTooltip title="Tips" content={<Text>Click and drag on plots to zoom</Text>} />
            </>
          }
          isLoading={isLoading}
          type="report-plot"
        >
          {!isEmpty(scanReliabilityData) && (
            <Col>
              <ClxCheesecakeDailyStatus 
                loadedData={scanReliabilityData}
                technology={technology}
                feature={feature}
                tags={scanReliabilityTags}
              />
            </Col>
          )}
        </Box>
      </Row>
    </>
  )
}

export default React.memo(ClxCheesecakeTrends)