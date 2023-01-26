import React, { useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import { getFetchUrl, getAllUrl, patchItems } from './helpers'
import { useFetchRafael } from '../../../../hooks/fetchData'
import MultiSelectForm from './MultiSelectForm'

const PredicateForm = ({ technology, feature }) => {
  const [isLoadingItems, items] = useFetchRafael({ url: getFetchUrl(technology, feature).PREDICATE }, [])
  const [isLoadingAll, allItems] = useFetchRafael({ url: getAllUrl().PREDICATE }, [])
  const isLoading = isLoadingItems || isLoadingAll

  const selectCallBack = (type, newItems, callBack, errorCallBack) => {
    patchItems(
      newItems,
      'PREDICATE',
      technology,
      feature,
      callBack,
      errorCallBack
    )
  }

  console.log('Rendering PredicateForm')
  return (
    <Row>
      <Col className="form-element">
        <MultiSelectForm
          technology={technology}
          feature={feature}
          type="predicate"
          items={items}
          allItems={allItems}
          selectCallBack={selectCallBack}
          title="Predicates"
        />
        <Spinner visible={isLoading} />
      </Col>
    </Row>
  )
}

export default React.memo(PredicateForm)
