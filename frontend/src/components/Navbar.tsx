import { Link, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

import { AUTH_TOKEN_NAME } from "../lib/config";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Bell, Menu } from "lucide-react";
import {
  useClearNotification,
  useFetchNotification,
} from "@/api/NotificationApi";
import { useQueryClient } from "@tanstack/react-query";
import NotificationItem from "./notification/NotificationItem";
import SearchBar from "./forms/SearchBar";
import { useGetMyUserData } from "@/api/UserApi";
import { Button } from "./ui/button";

export default function Navbar() {
  const navigate = useNavigate();

  const cookies = new Cookies(null, {
    path: "/",
  });

  const { myUser } = useGetMyUserData();

  const { notifications, isLoading: isNotificationLoading } =
    useFetchNotification();
  const { clearNotifications } = useClearNotification();
  const queryClient = useQueryClient();

  const logout = () => {
    cookies.remove(AUTH_TOKEN_NAME);
    navigate("/login");
  };

  return (
    <div className="w-full bg-white h-[4.5rem] shadow-md flex justify-between items-center px-2 md:px-10 md:px-14">
      <div className="flex gap-4">
        <Link to="/feed" className="hidden md:block">
          <span className="text-4xl font-bold text-blue-900 tracking-tighter">
            bagaicha
          </span>
        </Link>
        <SearchBar />
      </div>
      <div className="flex items-center gap-5">
        {myUser && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="relative">
                <Bell />
                {!!notifications && notifications.length > 0 && (
                  <p className="absolute top-0 right-0 bg-red-500 w-4 h-4 text-white rounded-full -translate-y-2 translate-x-1 text-sm">
                    {notifications.length}
                  </p>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onCloseAutoFocus={() => {
                clearNotifications();
                queryClient.invalidateQueries({ queryKey: ["notifications"] });
              }}
            >
              <div className="w-[16rem] h-[20rem] md:h-[30rem] md:w-[20rem] flex flex-col gap-4 px-2 py-3">
                {!isNotificationLoading &&
                !!notifications &&
                notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <NotificationItem notification={notification} />
                  ))
                ) : (
                  <h1 className="font-medium self-center text-lg align-middle">
                    {myUser
                      ? "No notifications"
                      : "Login to see your notifications"}
                  </h1>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {myUser && (
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger>My Account</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => navigate(`/user/${myUser.id}`)}
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/user/edit-profile")}
                >
                  My Setting
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <p onClick={() => logout()}>Logout</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {!myUser && (
          <div className="hidden md:block">
            <span className="flex flex-row gap-3">
              <Link to="/login">
                <Button type="button" className="bg-blue-900 hover:bg-blue-700">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  variant="outline"
                  type="button"
                  className="border-blue-900 text-blue-900 hover:text-blue-900"
                >
                  Sign Up
                </Button>
              </Link>
            </span>
          </div>
        )}
      </div>
      <div className="block md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <span className="text-4xl font-bold text-blue-900 tracking-tighter">
                bagaicha
              </span>
            </SheetHeader>
            <div className="mt-3 flex flex-col gap-4">
              <SheetClose asChild>
                <Link to={`/feed`}>Feed</Link>
              </SheetClose>
              {myUser && (
                <>
                  <SheetClose asChild>
                    <Link to={`/user/${myUser.id}`}>My Profile</Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/user/edit-profile">My Setting</Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/bookmarks">Bookmarks</Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/place/add">Add Place</Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/place/my">Manage Places</Link>
                  </SheetClose>
                  <p onClick={() => logout()}>Logout</p>
                </>
              )}
              <SheetClose asChild>
                <Link to="/find-places">Find Places</Link>
              </SheetClose>
              {!myUser && (
                <>
                  <SheetClose asChild>
                    <Link to="/login">Login</Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/signup">Signup</Link>
                  </SheetClose>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
