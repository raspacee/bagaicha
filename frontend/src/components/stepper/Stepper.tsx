import { useState, Fragment } from "react";
import Cookies from "universal-cookie";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useNavigate } from "react-router-dom";

import { useAppSelector, useAppDispatch } from "../../hooks";
import { AUTH_TOKEN } from "../../lib/cookie_names";
import { clearState } from "../../slice/addPlaceSlice";

export default function HorizontalLinearStepper({ steps }) {
  const [activeStep, setActiveStep] = useState(0);
  const [showSnack, setShowSnack] = useState(false);
  const [showError, setShowError] = useState<boolean>(false);
  const state = useAppSelector((state) => state.addplace);
  const cookies = new Cookies(null, {
    path: "/",
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const submitForm = async () => {
    if (
      state.placeName == "" ||
      state.placeLat == "" ||
      state.placeLong == "" ||
      state.relation == null ||
      state.displayPic == null ||
      state.foods.length == 0 ||
      state.drinks.length == 0
    ) {
      setShowSnack(true);
      handleBack();
      return;
    }
    try {
      const form = new FormData();
      form.append("placeName", state.placeName);
      form.append("placeLat", state.placeLat);
      form.append("placeLong", state.placeLong);
      form.append("foods", JSON.stringify(state.foods));
      form.append("drinks", JSON.stringify(state.drinks));
      form.append("relation", JSON.stringify(state.relation));
      form.append("displayPic", state.displayPic!);
      form.append("alcoholAllowed", JSON.stringify(state.alcoholAllowed));
      const res = await fetch(`${import.meta.env.VITE_API_URL}/place`, {
        method: "POST",
        body: form,
        mode: "cors",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
        },
      });
      const data = await res.json();
      if (data.status == "error") {
        setShowError(true);
      } else {
        setShowError(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleNext = () => {
    if (activeStep == steps.length - 1) {
      submitForm();
    }

    if (activeStep == 0) {
      if (state.relation == null) return;
    }

    if (activeStep == 1) {
      if (
        state.placeName == "" ||
        state.placeLat == "" ||
        state.placeLong == "" ||
        state.relation == null ||
        state.displayPic == null ||
        state.foods.length == 0 ||
        state.drinks.length == 0
      ) {
        return;
      }
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setShowSnack(false);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Snackbar open={showSnack} autoHideDuration={3000} onClose={handleClose}>
        <Alert
          severity="warning"
          variant="filled"
          sx={{ width: "100%" }}
          onClose={handleClose}
        >
          Please fill all the form input before submitting
        </Alert>
      </Snackbar>
      <Stepper activeStep={activeStep}>
        {steps.map((item, index) => {
          const stepProps: { completed?: boolean } = {};
          return (
            <Step key={item.label} {...stepProps}>
              <StepLabel>{item.label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
      <div className="w-full flex flex-col items-center">
        {steps.map((step, index) => {
          if (index == activeStep) {
            return step.component;
          }
        })}
      </div>
      {activeStep === steps.length ? (
        showError ? (
          <Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>
              Something went wrong, please try again
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button onClick={handleReset}>Reset</Button>
            </Box>
          </Fragment>
        ) : (
          <Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>
              The place was successfully added!
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button
                onClick={() => {
                  dispatch(clearState());
                  navigate("/feed");
                }}
              >
                Home
              </Button>
            </Box>
          </Fragment>
        )
      ) : (
        <Fragment>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </Fragment>
      )}
    </Box>
  );
}
