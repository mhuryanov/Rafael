import { JOBS_API } from '../../../../utilities/constants'
import { sendToServer } from '../../../../utilities/helpers'

export const patchJob = (jobToPatch, callBack, errorCallBack, method = 'PATCH') => {
  const url = `${JOBS_API}${jobToPatch.id}`
  const data = { ...jobToPatch }
  if ('id' in jobToPatch) { // caller will check present. Just protect here
    delete data.id
  }
  sendToServer(url, data, method, callBack, errorCallBack)
}

export const createJob = (jobToCreate, callBack, errorCallBack, method = 'POST') => {
  const url = `${JOBS_API}`
  const data = { ...jobToCreate }
  if ('id' in jobToCreate) { // caller will check NOT present. Just protect here
    delete data.id
  }
  sendToServer(url, data, method, callBack, errorCallBack)
}
