import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'

import { getFetchUrl, getAllUrl, patchItems } from './helpers'
import MultiSelectForm from './MultiSelectForm'
import { useFetchRafael } from '../../../../hooks/fetchData'

const AccessControlForm = ({ technology, feature }) => {
  const [isLoadingItems, items] = useFetchRafael({ url: getFetchUrl(technology, feature).ACCESS_CONTROL }, [])
  const [isLoadingAll, allItems] = useFetchRafael({ url: getAllUrl().ACCESS_CONTROL }, [])
  const [users, setUsers] = useState({
    admins: [],
    maintainers: []
  })
  const [allUsers, setAllUsers] = useState([])
  const isLoading = isLoadingItems || isLoadingAll
  const { admins, maintainers } = users

  useEffect(() => {
    if (!isLoading) {
      const { admins: adminList, maintainers: maintainerList } = items
      const newAdmins = adminList.map(user => user.email)
      const newMaintainers = maintainerList.map(user => user.email)
      const newAllUsers = allItems.map(user => user.email)
      setUsers({
        admins: newAdmins,
        maintainers: newMaintainers
      })
      setAllUsers(newAllUsers)
    }
  }, [isLoading, items, allItems])

  const selectCallBack = (type, newItems, callBack, errorCallBack) => {
    const newUsers = JSON.parse(JSON.stringify(users))
    newUsers[type] = newItems
    patchItems(
      newUsers,
      'ACCESS_CONTROL',
      technology,
      feature,
      callBack,
      errorCallBack
    )
  }

  return (
    <Row>
      <Col className="access-form-element">
        <MultiSelectForm
          technology={technology}
          feature={feature}
          type="admins"
          items={admins}
          allItems={allUsers}
          selectCallBack={selectCallBack}
          title="Admins"
        />
        <MultiSelectForm
          technology={technology}
          feature={feature}
          type="maintainers"
          items={maintainers}
          allItems={allUsers}
          selectCallBack={selectCallBack}
          title="Maintainers"
        />
        <Spinner visible={isLoading} />
      </Col>
    </Row>
  )
}

export default React.memo(AccessControlForm)
