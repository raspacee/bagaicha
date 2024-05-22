/* IMPORTANT - don't use this icon, causes error - 
import { CiCloudOn } from "@react-icons/all-files/ci/CiCloudOn";*/
import { IoCreateOutline } from "@react-icons/all-files/io5/IoCreateOutline";
import { FaUser } from "@react-icons/all-files/fa/FaUser";
import { BsBookmarkDashFill } from "@react-icons/all-files/bs/BsBookmarkDashFill";
import { MdOutlinePlace } from "@react-icons/all-files/md/MdOutlinePlace";
import StorefrontIcon from "@mui/icons-material/Storefront";

import { UserInterface } from "../../lib/types";
import { useAppSelector, useAppDispatch } from "../../hooks";
import SidebarItem from "./SidebarItem";

export default function SidebarLeft() {
  const user: UserInterface = useAppSelector((state) => state.user);

  return (
    <div className="bg-white w-full py-2 px-4 mt-3 rounded-md sticky top-4 ml-2 shadow-xl border border-slate-900">
      <SidebarItem text="Profile" link={`/user/${user.email}`} isButton={false}>
        <FaUser size={30} fill="blue" />
      </SidebarItem>
      <SidebarItem text="Find Places" link="/find-places" isButton={false}>
        <MdOutlinePlace size={30} />
      </SidebarItem>
      <SidebarItem text="Post a review" link="/feed/create" isButton={false}>
        <IoCreateOutline size={35} />
      </SidebarItem>
      <SidebarItem text="Bookmarks" link="/bookmarks" isButton={false}>
        <BsBookmarkDashFill size={30} />
      </SidebarItem>
      <SidebarItem isButton={false} text="Help" link="/">
        <IoCreateOutline size={35} />
      </SidebarItem>
      <SidebarItem isButton={false} text="Suggestions" link="/">
        <IoCreateOutline size={35} />
      </SidebarItem>
      <SidebarItem isButton={false} text="Add a place" link="/place/add">
        <StorefrontIcon fontSize="medium" />
      </SidebarItem>
      <SidebarItem text="Log Out" link="/logout" isButton={true}>
        <IoCreateOutline size={35} />
      </SidebarItem>
    </div>
  );
}
