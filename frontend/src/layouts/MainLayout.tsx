import React from "react";
import SidebarLeft from "../components/sidebar/Sidebar";
import Navbar from "../components/Navbar";
import ImgModal from "../components/modal/ImgModal";
import PostCreateModal from "../components/modal/PostCreateModal";

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
  return (
    <div className="h-fit min-h-screen bg-gray-200">
      <Navbar />
      <main className="grid grid-cols-4 gap-1">
        <aside className="col-span-1">
          <SidebarLeft />
        </aside>
        <div className="col-span-3">{children}</div>
      </main>
      <ImgModal />
      <PostCreateModal />
    </div>
  );
};

export default MainLayout;
