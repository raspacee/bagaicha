import { useState, useRef } from "react";
import Typography from "@mui/material/Typography";
import SendIcon from "@mui/icons-material/Send";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function Suggestions() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const handleClick = () => {
    ref!.current!.value = "";
    setOpen(true);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  return (
    <div className="bg-white shadow-lg rounded-md mt-3 ml-3 mr-2 flex flex-col justify-center items-center h-[30rem]">
      <Typography variant="h5">
        Suggest features that you want to add to this site
      </Typography>
      <textarea
        className="my-3 resize-none border-gray-400 w-[30rem] h-[15rem] rounded-md"
        placeholder="write your suggestion here"
        ref={ref}
      ></textarea>
      <Button variant="contained" onClick={handleClick} endIcon={<SendIcon />}>
        Submit
      </Button>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Thank you for your valuable suggestion
        </Alert>
      </Snackbar>
    </div>
  );
}
