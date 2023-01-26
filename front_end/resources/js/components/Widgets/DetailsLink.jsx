import React, { useState, lazy, Suspense } from 'react'
import { Icons } from '@tidbits/react-tidbits'
import { InlineSpinner } from '@tidbits/react-tidbits/Spinner'

const ItemPopup = lazy(() => import('../Pages/StatusPage/DirectoryBody/Popup'))
const ReProcessModalMenu = lazy(() => import('../Widgets/ReProcessModalMenu'))
const DetailsLink = ({ itemId, itemType, icon, popupType }) => {
  const Popup = popupType == "ReProccess" ? ReProcessModalMenu : ItemPopup
  const DefaultIcon = popupType == "ReProccess" ? Icons.SkipForwardIcon : Icons.MoreIcon
  const [showPopup, setShowPopup] = useState(false)
  const onPopupOpen = () => {
    setShowPopup(true)
  }
  const onPopupClose = () => {
    setShowPopup(false)
  }

  return (
    <>
      <span className="details-link" onClick={() => setShowPopup(!showPopup)}>
        {icon || <DefaultIcon
          cursor="pointer"
          height="15px"
          width="15px"
        />}
      </span>
      {showPopup && (
        <Suspense fallback={<InlineSpinner visible />}>
          <Popup itemType={itemType} itemId={itemId} show={onPopupOpen} onClose={onPopupClose} />
        </Suspense>
      )}
    </>
  )
}

export default React.memo(DetailsLink)
