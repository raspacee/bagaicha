import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

import { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@mui/material/Button";

import { AUTH_TOKEN } from "../lib/cookie_names";
import { UserSettingSchema, UserSettingType } from "../lib/schemas";

export default function EditProfile() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserSettingType>({
    resolver: zodResolver(UserSettingSchema),
  });
  const cookies = new Cookies(null, {
    path: "/",
  });
  const [user, setUser] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | File | null>(null);
  const [successAlert, setSuccessAlert] = useState(false);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const res = await fetch(`${import.meta.env.VITE_API_URL}/user/`, {
          mode: "cors",
          headers: {
            authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
          },
        });
        const data = await res.json();
        if (data.status == "ok") {
          setProfilePic(data.user.profile_picture_url);
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const form = new FormData();
      if (typeof profilePic == "object") {
        form.append("new_profile_pic", profilePic!);
      }
      form.append("first_name", data.first_name);
      form.append("last_name", data.last_name);
      form.append("bio", data.bio);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/settings`, {
        method: "PUT",
        mode: "cors",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
        },
        body: form,
      });
      const result = await res.json();

      if (result.status == "ok") {
        setOpen(true);
        setSuccessAlert(true);
      } else {
        throw new Error();
      }
    } catch (err) {
      setOpen(true);
      setSuccessAlert(false);
      console.log(err);
    }
  };

  if (user == null) {
    return (
      <>
        <div className="bg-white shadow-lg min-h-[400px] w-3/4 my-3 mx-3 rounded-md flex flex-col justify-center items-center">
          <Skeleton variant="circular" width={100} height={100} />
          <div className="my-2"></div>
          <Skeleton variant="rounded" width={400} height={150} />
        </div>
      </>
    );
  }

  return (
    <div className="bg-white shadow-lg min-h-[400px] my-3 mx-3 rounded-md px-3 py-2 w-3/4">
      <h1 className="w-full text-center text-2xl font-medium">User settings</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col items-center mt-3"
      >
        <div className="relative">
          <label htmlFor="new-profile-pic">
            <img
              src={
                typeof profilePic == "string"
                  ? profilePic
                  : URL.createObjectURL(profilePic!)
              }
              alt="Profile picture"
              className="h-32 w-32 rounded-full object-cover cursor-pointer"
              width="200"
              height="200"
            />
          </label>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <PhotoCameraIcon fontSize="large" />
          </div>
          <input
            type="file"
            id="new-profile-pic"
            hidden
            accept="image/*"
            onChange={(e) => setProfilePic(e.target.files![0])}
          />
        </div>
        <input
          type="text"
          className="w-[300px] my-1 border border-gray-400 rounded-md"
          placeholder="your firstname"
          {...register("first_name")}
          defaultValue={user.first_name}
        />
        <div id="email-error" aria-live="polite" aria-atomic="true">
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-500">
              {errors.first_name.message}
            </p>
          )}
        </div>
        <input
          type="text"
          className="w-[300px] my-1 border border-gray-400 rounded-md"
          placeholder="your lastname"
          {...register("last_name")}
          defaultValue={user.last_name}
        />
        <div id="email-error" aria-live="polite" aria-atomic="true">
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-500">
              {errors.last_name.message}
            </p>
          )}
        </div>
        <span className="my-2">
          <textarea
            className="w-[300px] h-[180px] resize-none border border-gray-400 rounded-md"
            placeholder="your bio here"
            {...register("bio")}
            defaultValue={user.bio == null ? "" : user.bio}
          />
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {errors.bio && (
              <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>
            )}
          </div>
        </span>

        <Button variant="outlined" type="submit">
          Save settings
        </Button>
      </form>
      <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
        {successAlert ? (
          <Alert
            onClose={handleClose}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            Successfully updated your settings
          </Alert>
        ) : (
          <Alert
            onClose={handleClose}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            Something went wrong! Please try again
          </Alert>
        )}
      </Snackbar>
    </div>
  );
}
