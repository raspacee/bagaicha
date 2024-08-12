import React from "react";
import SidebarLeft from "../components/sidebar/Sidebar";
import Navbar from "../components/Navbar";
import ImgModal from "../components/modal/ImgModal";

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
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
