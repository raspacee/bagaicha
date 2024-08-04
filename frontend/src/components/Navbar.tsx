import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { useState } from "react";
import Button from "@mui/material/Button";

import { AUTH_TOKEN_NAME } from "../lib/config";
import { useAppSelector, useAppDispatch } from "../hooks";
import { setSearchModal } from "../slice/modalSlice";
import SearchModal from "./modal/SearchModal";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Bell, Menu } from "lucide-react";
import {
  useClearNotification,
  useFetchNotification,
} from "@/api/NotificationApi";
import { useQueryClient } from "@tanstack/react-query";
import NotificationItem from "./notification/NotificationItem";
import { DateTime } from "luxon";
import SearchBar from "./forms/SearchBar";

export default function Navbar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const isLoggedIn = true;

  const cookies = new Cookies(null, {
    path: "/",
  });

  const { notifications, isLoading: isNotificationLoading } =
    useFetchNotification();
  const { clearNotification } = useClearNotification();
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
              clearNotification();
              queryClient.invalidateQueries({ queryKey: ["notifications"] });
            }}
          >
            <div className="w-[16rem] h-[20rem] md:h-[30rem] md:w-[20rem] flex flex-col gap-4 px-2 py-3">
              {!isNotificationLoading &&
              !!notifications &&
              notifications.length > 0 ? (
                notifications?.map((notification) => {
                  const imageUrl = notification.user_profile_picture_url;

                  const date = DateTime.fromISO(notification.created_at)
                    .toRelative()
                    ?.toString()!;
                  let message = "";
                  if (
                    notification.object_type == "review" &&
                    notification.action_type == "like"
                  ) {
                    message = `${notification.fullname} liked your post`;
                  } else if (
                    notification.object_type == "comment" &&
                    notification.action_type == "like"
                  ) {
                    message = `${notification.fullname} liked your comment`;
                  } else if (
                    notification.object_type == "review" &&
                    notification.action_type == "comment"
                  ) {
                    message = `${notification.fullname} commented on your post`;
                  }
                  return (
                    <NotificationItem
                      imageUrl={imageUrl}
                      date={date}
                      message={message}
                    />
                  );
                })
              ) : (
                <h1 className="font-medium">No notifications</h1>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger>My Account</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/user/edit-profile">My Setting</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <p onClick={() => logout()}>Logout</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="block md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button>
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
              <Link to="">My Profile</Link>
              <Link to="/user/edit-profile">My Setting</Link>
              <p onClick={() => logout()}>Logout</p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
