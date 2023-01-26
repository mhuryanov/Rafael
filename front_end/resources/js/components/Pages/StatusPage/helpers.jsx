import React from 'react'
import { Count } from '@dx/continuum-count'
const GetVariant = (status) => {
  switch (status) {
    case "RUNNING":
      return "info"
    case "TRIGGERED":
      return "notice"
    case "SUCCEEDED":
      return "confirm"
    case "FAILED":
      return "danger"
    case "FATAL":
      return "danger"
    default:
      return "primary"
  }
}
export const getTaskStatusCount = (pipelinestatus) => {
  const job_status = (pipelinestatus.includes("__")) ? pipelinestatus.split("__")[1] : pipelinestatus
  return <Count variant={GetVariant(job_status)} >{job_status}</Count>
}