import { IoIosNotifications } from "@react-icons/all-files/io/IoIosNotifications";

import { Link } from "react-router-dom";
import Cookies from "universal-cookie";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { AUTH_TOKEN } from "../lib/cookie_names";
import NotificationModel from "./modal/NotificationModal";
import { useAppSelector, useAppDispatch } from "../hooks";
import { setNotificationModal, setSearchModal } from "../slice/modalSlice";
import SearchModal from "./modal/SearchModal";

export default function Navbar() {
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
        console.log(data);
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

    //const interval = setInterval(fetchNotifications, 10000);

    /*return () => {
      clearInterval(interval);
    };*/
  }, []);

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
              onBlur={() => dispatch(setSearchModal({ value: false }))}
            />
          </div>
        </div>
        <div className="col-span-6">
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
        </div>
        {!isLoggedIn && (
          <div className="h-full">
            <Link to="/login">
              <button className="h-full px-4 bg-blue-500 text-white mr-3 font-medium text-lg">
                Log In
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-4 h-full bg-green-500 text-white font-medium text-lg">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </nav>
      <div className="relative">
        <SearchModal />
      </div>
    </div>
  );
}
