import React, { Suspense, useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Spinner } from '@tidbits/react-tidbits/Spinner'
import SimpleImageSlider from "react-simple-image-slider"


import { useFetchRafael } from '../hooks/fetchData'
import { STORAGE_API } from '../utilities/constants'
import { isEmpty } from '../utilities/helpers'
import Box from './Box'

const StorageImages = ({
  ownerUUID,
}) => {
  const [isLoading, storageInfo] = useFetchRafael({ url: `${STORAGE_API}${ownerUUID}/list_storages/`}, [])
  const { errorMessage } = storageInfo
  const [imgURLs, setImgURLs] = useState([])

  useEffect(() => {
    if (!isLoading && (!errorMessage)) {
      const urls = storageInfo.filter(storage => storage.download_link)
        .map(storage => ({ url: storage.download_link}))
      setImgURLs(urls)
    }
  }, [isLoading, storageInfo])
  
  console.log(`Rendering StorageImages for ${ownerUUID}`)
  return (
    <>
      {(!isEmpty(imgURLs)) && (
        <Box 
          title={"Images"}
          isLoading={isLoading}
        >
          <SimpleImageSlider 
            width={400}
            height={600}
            showBullets={true}
            showNavs={true}
            images={imgURLs}
            />
        </Box>
      )}
    </>
  )
}



export default React.memo(StorageImages)