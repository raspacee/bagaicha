import { Outlet, useLoaderData } from "react-router-dom";

import SidebarLeft from "../components/sidebar/Sidebar";
import Navbar from "../components/Navbar";
import ImgModal from "../components/modal/ImgModal";
import PostCreateModal from "../components/modal/PostCreateModal";
import type { LocationType, UserInterface } from "../lib/types";
import { setUser } from "../slice/userSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setLocation } from "../slice/locationSlice";

export default function Root() {
  const user = useLoaderData() as UserInterface;

  const dispatch = useAppDispatch();
  dispatch(setUser(user));

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(grantLocation, notGrantLocation);
  } else {
    console.log("Geolocation not supported");
  }

  function grantLocation(position: GeolocationPosition) {
    const user_location: LocationType = {
      lat: position.coords.latitude,
      long: position.coords.longitude,
    };
    localStorage.setItem("userLat", position.coords.latitude.toString());
    localStorage.setItem("userLong", position.coords.longitude.toString());
    dispatch(setLocation(user_location));
  }

  function notGrantLocation() {
    /* -1 represents invalid location type */
    const user_location: LocationType = {
      lat: -1,
      long: -1,
    };

    dispatch(setLocation(user_location));
  }

  return (
    <main className="h-fit min-h-screen bg-gray-200">
      <Navbar />
      <main className="grid grid-cols-4 gap-1">
        <aside className="col-span-1">
          <SidebarLeft />
        </aside>
        <div className="col-span-3">
          <Outlet />
        </div>
      </main>
      <ImgModal />
      <PostCreateModal />
    </main>
  );
}
