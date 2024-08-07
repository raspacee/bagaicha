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
      <main className="flex gap-3 mt-3">
        <aside className="hidden md:block">
          <SidebarLeft />
        </aside>
        <div className="flex-1">{children}</div>
      </main>
      <ImgModal />
      <PostCreateModal />
    </div>
  );
};

export default MainLayout;
