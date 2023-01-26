

import React from 'react';

import { Suspense, lazy } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { IoMdAddCircle } from 'react-icons/io/index'
import { createSelectObject } from '../../../../../utilities/helpers'
import PropTypes from 'prop-types'
const MetaKeyValue = lazy(() => import('./MetaKeyValue'));
const shortid = require('shortid');
const _ = require('underscore')


const ItemMeta = ({ allMetaDistinct, itemMeta, onMetaRemove, onMetaAdd, onKeyChange, onValueChange }) => {

  if (allMetaDistinct && itemMeta) {
    const keyOptions = createSelectObject(allMetaDistinct.key)
    const valueOptions = createSelectObject(allMetaDistinct.value)

    return <Container fluid>
      <Suspense fallback={<Spinner animation="grow" variant="info" />}>
        {_.map(_.sortBy(itemMeta, ({ key }) => key.replace(/_/g, '')), ({ value, key, id }) => <MetaKeyValue
          metaKey={createSelectObject(key)}
          metaValue={createSelectObject(value)}
          onKeyChange={onKeyChange}
          onValueChange={onValueChange}
          keyOptions={keyOptions}
          valueOptions={valueOptions}
          key={shortid.generate()}
          id={id}
          onRemove={onMetaRemove}
        />)}
        <IoMdAddCircle style={{ color: 'green', fontSize: 30 }} onClick={onMetaAdd} />
      </Suspense>
    </Container>

  }


}

ItemMeta.propTypes = {
  allMetaDistinct: PropTypes.object.isRequired,
  itemMeta: PropTypes.object.isRequired,
  onMetaAdd: PropTypes.func.isRequired,
  onMetaRemove: PropTypes.func.isRequired,
  onKeyChange: PropTypes.func.isRequired,
  onValue: PropTypes.func.isRequired,
}


export default React.memo(ItemMeta)


