/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React from 'react'
import {
  Row, Col, Form, InputGroup, Button
} from 'react-bootstrap'
import PropType from 'prop-types'
import { FaCopy } from 'react-icons/fa/index'
import { labelCase, StringToClipboard, list2TestAreaText, formatBytes } from '../../../../../utilities/helpers'

const _ = require('underscore')
const shortid = require('shortid')

const skipAtt = ['meta', 'file_path', 'cluster_name', 'fieldtest_id', 'archive_type', 'segments', 'archives', 'Segments']
const ItemAttributes = ({ info }) => {
  if (info === undefined) {
    return null
  }

  const itemAttributes = _.omit(info, [skipAtt])
  const rows = _.map(itemAttributes, (value, key) => (
    <Col lg={12} sm={12} key={shortid.generate()}>
      <InputGroup>
        <InputGroup.Prepend as={Col} lg={4}>
          <InputGroup.Text as={Col} lg={12}>{labelCase(key)}</InputGroup.Text>
        </InputGroup.Prepend>
        {(!Array.isArray(value))
          ? (
            <Form.Control
              type="text"
              value={key === 'file_size' ? formatBytes(value) : value.toString()}
              readOnly
            />
          ) : (
            <Form.Control as="textarea" rows={Math.min(value.length, 5)} readOnly>
              {list2TestAreaText(value)}
            </Form.Control>
          )}
        <InputGroup.Prepend>
          <Button onClick={() => { StringToClipboard(value.toString()) }} style={{ backgroundColor: 'lightblue' }}><FaCopy /></Button>
        </InputGroup.Prepend>
      </InputGroup>
    </Col>
  ))

  return (
    <Form>
      <Row>
        {rows}
      </Row>
    </Form>
  )
}
ItemAttributes.propTypes = {
  info: PropType.object.isRequired

}
export default React.memo(ItemAttributes)
