import { SelectDropdown } from "@dx/continuum-select-dropdown"
import { Text } from "@tidbits/react-tidbits"
import React from "react"
import { Col } from "react-bootstrap"
import { KPI_NAMES } from "../../../utilities/constants"

const AggregatedDropdown = ({ technology, feature, filter, filterOptions, title, callBack }) => {
  return (
    <Col className="aggregate-dropdown">
      <Text textStyle="bodyRegular" mb="0px" ml="2px">
        {title}
      </Text>
      <SelectDropdown
        value={{ label: KPI_NAMES[technology][filter] || filter, value: filter }}
        options={filterOptions.map((option) => ({ label: KPI_NAMES[technology][option] || option, value: option }))}
        onChange={callBack}
      />
    </Col>
  )
}

export default React.memo(AggregatedDropdown)
