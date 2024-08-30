import React, { useEffect } from "react";
import SidebarLeft from "../components/sidebar/Sidebar";
import Navbar from "../components/Navbar";
import ImgModal from "../components/modal/ImgModal";
import { useAppDispatch } from "@/hooks";
import { setLocation } from "@/slice/locationSlice";

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Your device does not support geolocation");
    }
    navigator.geolocation.getCurrentPosition((position) => {
      dispatch(
        setLocation({
          lat: position.coords.latitude,
          long: position.coords.longitude,
        })
      );
    });
  }, []);
  return (
    <div className="h-fit min-h-screen bg-white">
      <Navbar />
      <main className="flex gap-3 mt-3">
        <aside className="hidden md:block">
          <SidebarLeft />
        </aside>
        <div className="flex-1">{children}</div>
      </main>
      <ImgModal />
    </div>
  );
};

export default MainLayout;
