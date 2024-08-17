import {
  BookmarkCheck,
  BookOpen,
  HandHelping,
  HousePlus,
  Salad,
  User,
} from "lucide-react";
import { useGetMyUserData } from "../../api/UserApi";
import { NavLink } from "react-router-dom";

type SidebarLink = {
  label: string;
  url: string;
  icon: JSX.Element;
};

export default function SidebarLeft() {
  const { myUser, isLoading } = useGetMyUserData();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!myUser) {
    return <h1>Failed to get user data, logout & login</h1>;
  }

  const links: SidebarLink[] = [
    { label: "Feed", url: "/feed", icon: <BookOpen size={36} /> },
    {
      label: "My Profile",
      url: `/user/${myUser.id}`,
      icon: <User size={36} className="text-blue-900" />,
    },
    {
      label: "Find Places",
      url: `/find-places`,
      icon: <Salad size={36} />,
    },
    {
      label: "Bookmarks",
      url: `/bookmarks`,
      icon: <BookmarkCheck size={36} />,
    },
    {
      label: "Add Place",
      url: `/place/add`,
      icon: <HousePlus size={36} />,
    },
    {
      label: "Suggestions",
      url: `/suggestions`,
      icon: <HandHelping size={36} />,
    },
  ];

  return (
    <div className="py-2 px-4 sticky top-0 border-r md:w-[15rem] h-screen flex flex-col gap-6 pt-5">
      {links.map((link) => (
        <div key={link.label} className="flex gap-4">
          {link.icon}
          <NavLink
            to={link.url}
            className={({ isActive }) => {
              let cls = "text-lg w-[10rem]";
              if (isActive) cls += " font-semibold";
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
