/* IMPORTANT - don't use this icon, causes error - 
import { CiCloudOn } from "@react-icons/all-files/ci/CiCloudOn";*/
import { IoCreateOutline } from "@react-icons/all-files/io5/IoCreateOutline";
import { FaUser } from "@react-icons/all-files/fa/FaUser";
import { BsBookmarkDashFill } from "@react-icons/all-files/bs/BsBookmarkDashFill";
import { MdOutlinePlace } from "@react-icons/all-files/md/MdOutlinePlace";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PlaceIcon from "@mui/icons-material/Place";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import AssistantIcon from "@mui/icons-material/Assistant";

import SidebarItem from "./SidebarItem";
import { useGetMyUserData } from "../../api/UserApi";

export default function SidebarLeft() {
  const { myUser, isLoading } = useGetMyUserData();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!myUser) {
    return <h1>Failed to get user data, logout & login</h1>;
  }

  return (
    <div className="w-full py-2 px-4 sticky top-0 border-r md:w-[15rem] h-screen">
      <SidebarItem text="Profile" link={`/user/${myUser.id}`} isButton={false}>
        <AccountCircleIcon fontSize="large" style={{ color: "#0d47a1" }} />
      </SidebarItem>
      <SidebarItem text="Find Places" link="/find-places" isButton={false}>
        <PlaceIcon fontSize="large" />
      </SidebarItem>
      <SidebarItem text="Bookmarks" link="/bookmarks" isButton={false}>
        <BookmarksIcon fontSize="large" />
      </SidebarItem>
      <SidebarItem isButton={false} text="Add a place" link="/place/add">
        <StorefrontIcon fontSize="large" />
      </SidebarItem>
      <SidebarItem isButton={false} text="Suggestions" link="/suggestions">
        <AssistantIcon fontSize="large" />
      </SidebarItem>
    </div>
  );
}
