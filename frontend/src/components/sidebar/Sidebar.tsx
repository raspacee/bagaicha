import {
  BookmarkCheck,
  BookOpen,
  HandHelping,
  HousePlus,
  LogIn,
  Salad,
  User,
} from "lucide-react";
import { useGetMyUserData } from "../../api/UserApi";
import { NavLink } from "react-router-dom";
import { toast } from "sonner";

type SidebarLink = {
  showAuthAlert: boolean;
  label: string;
  url: string;
  icon: JSX.Element;
};

export default function SidebarLeft() {
  const { myUser, isLoading } = useGetMyUserData();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  const links: SidebarLink[] = [
    {
      showAuthAlert: false,
      label: "Feed",
      url: "/feed",
      icon: <BookOpen size={36} />,
    },
    {
      showAuthAlert: true,
      label: "My Profile",
      url: `/user/${myUser?.id}`,
      icon: <User size={36} className="text-blue-900" />,
    },
    {
      showAuthAlert: false,
      label: "Find Places",
      url: `/find-places`,
      icon: <Salad size={36} />,
    },
    {
      showAuthAlert: true,
      label: "Bookmarks",
      url: `/bookmarks`,
      icon: <BookmarkCheck size={36} />,
    },
    {
      showAuthAlert: true,
      label: "Add Place",
      url: `/place/add`,
      icon: <HousePlus size={36} />,
    },
    {
      showAuthAlert: true,
      label: "Manage Places",
      url: `/place/my`,
      icon: <HandHelping size={36} />,
    },
  ];

  return (
    <div className="py-2 px-4 sticky top-0 border-r md:w-[15rem] h-screen flex flex-col gap-6 pt-5">
      {!myUser && (
        <div className="flex gap-4">
          <LogIn size={36} className="animate-pulse" />
          <NavLink to="/login" className="text-lg w-[10rem]">
            Login
          </NavLink>
        </div>
      )}
      {links.map((link) => (
        <div key={link.label} className="flex gap-4">
          {link.icon}
          <NavLink
            onClick={(e) => {
              if (link.showAuthAlert && !myUser) {
                e.preventDefault();
                toast.error("Please login to continue");
              }
            }}
            to={link.url}
            className={({ isActive }) => {
              let cls = "text-lg w-[10rem]";
              if (isActive) cls += " font-semibold";
              if (link.showAuthAlert && !myUser) cls += " cursor-not-allowed";
              return cls;
            }}
          >
            {link.label}
          </NavLink>
        </div>
      ))}
    </div>
  );
}
