import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography'
import { sendToServer } from '../../../../../utilities/helpers'
import Constants from '../../../../../utilities/constants'
import useDeepCompareEffect from 'use-deep-compare-effect'


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  button: {
    marginRight: theme.spacing(1),
  },
  completed: {
    display: 'inline-block',
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));



export default function HorizontalNonLinearStepper({ info, itemType, lastHistory }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(-1);
  const [steps, setSteps] = useState([]);
  const [errorIndex, setErrorIndex] = useState(-1);
  useEffect(() => {
    const baseUrl = itemType === "Archive" ? Constants.ARCHIVE_API : Constants.FIELDTEST_API
    sendToServer(`${baseUrl + info.id}/proccessing_jobs`, {}, 'GET', (data) => {
      setSteps(Object.values(data)[0].map(j => j.job__name).reverse())
    })
  }, [])

  useDeepCompareEffect(() => {
    if (lastHistory && steps.length > 0) {
      const { pipelinestate } = lastHistory
      const job_status = pipelinestate.split('__')
      const index = (job_status[0] == "Processing") ? steps.length + 1 : steps.findIndex((job_name) => job_name === job_status[0])
      setActiveStep((!["SUCCEEDED", "FAILED"].includes(job_status[1])) ? index + 1 : index)
      if ("FAILED" === job_status[1]) {
        setErrorIndex(index)
      }

    } else {
      setActiveStep(1000) // enabled all .. where there are no history 
    }

  }, [steps, lastHistory])
  return (steps.length != 0 &&
    <div className={classes.root}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (index === errorIndex) {
            labelProps.optional = (
              <Typography variant="caption" color="error">
                Job Failed
              </Typography>
            );
          }
          if (index === errorIndex) {
            labelProps.error = true;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
              {label}
            </Step>)
        }
        )
        }

      </Stepper>
    </div >
  );
}