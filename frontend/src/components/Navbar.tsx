import { IoIosNotifications } from "@react-icons/all-files/io/IoIosNotifications";

import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import { AUTH_TOKEN } from "../lib/cookie_names";
import NotificationModel from "./modal/NotificationModal";
import { useAppSelector, useAppDispatch } from "../hooks";
import { setNotificationModal, setSearchModal } from "../slice/modalSlice";
import SearchModal from "./modal/SearchModal";

export default function Navbar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const isLoggedIn = true;
  const notifications = useAppSelector(
    (state) => state.modal.notificationModal.notifications,
  );

  const notificationDisplay = useAppSelector(
    (state) => state.modal.notificationModal.display,
  );
  const cookies = new Cookies(null, {
    path: "/",
  });
  const dispatch = useAppDispatch();

  const toggleNotification = () => {
    if (notificationDisplay) {
      fetch(`${import.meta.env.VITE_API_URL}/notification/read`, {
        method: "get",
        mode: "cors",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
        },
      });
      dispatch(
        setNotificationModal({
          value: !notificationDisplay,
          notifications: [],
        }),
      );
    } else {
      dispatch(setNotificationModal({ value: !notificationDisplay }));
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/notification`,
          {
            method: "get",
            mode: "cors",
            headers: {
              authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
            },
          },
        );
        const data = await res.json();
        if (data.status == "ok") {
          dispatch(
            setNotificationModal({
              value: false,
              notifications: data.notifications || [],
            }),
          );
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchNotifications();
  }, []);

  const logout = () => {
    cookies.remove(AUTH_TOKEN);
    navigate("/login");
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = (e) => {};

  return (
    <div>
      <nav className="bg-white w-full h-16 px-10 items-center grid grid-cols-12 shadow-lg border-b-gray-900">
        <div className="col-span-6 flex">
          <div className="h-5/6 flex">
            <Link to="/feed">
              <span className="text-4xl font-bold text-blue-900">bagaicha</span>
            </Link>
            <motion.input
              whileFocus={{
                width: "350px",
              }}
              type="text"
              className="h-full px-2 outline-none ml-2 bg-gray-200 border-gray-200 rounded-md
            focus:z-50"
              placeholder="search something"
              onFocus={() => dispatch(setSearchModal({ value: true }))}
              value={searchQuery}
              onChange={(e) => {
                //setSearchParams({ q: e.target.value });
                setSearchQuery(e.target.value);
              }}
              onKeyPress={(e) => {
                if (e.key == "Enter" && searchQuery.trim() != "") {
                  navigate("/search?q=" + searchQuery);
                  dispatch(setSearchModal({ value: false }));
                  (e.target as HTMLInputElement).blur();
                }
              }}
            />
          </div>
        </div>
        <div className="col-span-6 flex justify-evenly">
          <div className="relative">
            <div className="relative w-fit">
              <motion.div
                whileTap={{
                  scale: 0.9,
                }}
              >
                <IoIosNotifications
                  size={35}
                  className="text-gray-600 cursor-pointer"
                  onClick={toggleNotification}
                />
              </motion.div>
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 rounded-full text-center text-white -translate-y-2 select-none">
                  {notifications.length}
                </span>
              )}
            </div>
            <NotificationModel />
          </div>

          <div>
            <Button
              id="basic-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
            >
              My account
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem
                onClick={() => {
                  navigate("/user/edit-profile");
                  handleClose();
                }}
              >
                Account Settings
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  logout();
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </div>
        </div>
      </nav>
      <div className="relative">
        <SearchModal />
      </div>
    </div>
  );
}
