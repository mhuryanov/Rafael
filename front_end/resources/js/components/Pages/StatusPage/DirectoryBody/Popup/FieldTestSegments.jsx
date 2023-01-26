/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { useState } from 'react'
import {
  Row, Col, Form, InputGroup, Button
} from 'react-bootstrap'
import PropType from 'prop-types'
import { Input } from '@dx/continuum-input'
import { FaCopy } from 'react-icons/fa/index'
import { labelCase, StringToClipboard, list2TestAreaText, formatBytes } from '../../../../../utilities/helpers'
import { IoMdAddCircle } from 'react-icons/io/index'
import { MdDeleteForever } from 'react-icons/md/index'
import { StatePanel } from '@dx/continuum-state-panel'

const _ = require('underscore')
const shortid = require('shortid')


const SegmentEntry = ({ segment }) => {

  return (
    <Row style={{ margin: '15px', paddingBottom: '15px', borderBottom: '1px solid rgb(214, 214, 214)' }}>
      <Col sm={8}>
        {Object.entries(segment).map(([field, value]) => (
          <Row key={field} style={{ margin: '2px' }}>
            <Col sm={4}>
              {field}
            </Col>
            <Col sm={8}>
              {value}
            </Col>
          </Row>
        ))}
      </Col>
    </Row>
  )
}


const FieldTestSegments = ({ info }) => {
  if (info === undefined) {
    return null
  }
  const { segments } = info


  return (
    segments.length > 0 ? (
      <>
        {segments.map(segment => (
          <SegmentEntry
            key={shortid.generate()}
            segment={segment}
          />
        ))}
      </>
    ) : (
      <StatePanel message="No segments to show." suggestion="Something may have went wrong during processing." />
    )
  )
}
FieldTestSegments.propTypes = {
  info: PropType.object.isRequired,
}
SegmentEntry.propTypes = {
  segment: PropType.array.isRequired,
}

export default React.memo(FieldTestSegments)
