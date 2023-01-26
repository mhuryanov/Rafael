/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/forbid-prop-types */

import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'react-bootstrap'
import CreatableSelect from 'react-select/creatable'
import { MdDeleteForever } from 'react-icons/md/index'

const MetaKeyValue = props => (
  <Row style={{ paddingTop: '5px', paddingBottom: '5px' }}>
    <Col sm="5">
      <CreatableSelect
        isSearchable
        defaultValue={props.metaKey}
        onChange={(newValue) => { props.onKeyChange(newValue, props.id) }}
        options={props.keyOptions}

      />
    </Col>
    <Col sm="6">
      <CreatableSelect
        isSearchable
        defaultValue={props.metaValue}
        onChange={(newValue) => { props.onValueChange(newValue, props.id) }}
        options={props.valueOptions}

      />
    </Col>
    <MdDeleteForever style={{ color: 'red', fontSize: 30 }} onClick={() => props.onRemove(props.id)} />
  </Row>
)
MetaKeyValue.propTypes = {
  metaKey: PropTypes.object.isRequired,
  metaValue: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  keyOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  valueOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRemove: PropTypes.func.isRequired,
  onKeyChange: PropTypes.func.isRequired,
  onValueChange: PropTypes.func.isRequired
}
export default MetaKeyValue
