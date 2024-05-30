import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import Divider from "@mui/material/Divider";

import { useAppSelector, useAppDispatch } from "../../hooks";
import { setSearchModal } from "../../slice/modalSlice";
import { AUTH_TOKEN } from "../../lib/cookie_names";

export default function SearchModal() {
  const display = useAppSelector((state) => state.modal.searchModal.display);
  const [history, setHistory] = useState<any[]>([]);
  const cookies = new Cookies(null, {
    path: "/",
  });
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/search/history`,
          {
            headers: {
              authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
            },
          },
        );
        if (!res.ok) {
          throw new Error();
        }
        const data = await res.json();
        if (data.results != null) {
          setHistory(data.results);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchHistory();
  }, [display]);

  const clearHistory = async (e) => {
    e.stopPropagation();

    try {
      if (history.length != 0) {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/search/history`,
          {
            method: "delete",
            headers: {
              authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
            },
          },
        );
        if (!res.ok) {
          throw new Error();
        }
        setHistory([]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (!display) {
    return null;
  }
  return (
    <div
      className="absolute left-0 top-0 w-screen h-screen bg-black bg-opacity-80 z-50"
      onClick={(e) => {
        if (e.target.id == "closeModal") {
          dispatch(setSearchModal({ value: false }));
        }
      }}
      id="closeModal"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, x: 30, transformOrigin: "top" }}
        className="absolute left-0 top-0 w-96 h-fit bg-white translate-x-16 p-2 shadow-xl border border-gray-200 rounded-md"
      >
        <div className="flex justify-between">
          <h1 className="font-bold text-gray-800">Recent searches</h1>
          <button
            className="font-bold text-blue-500 cursor-pointer"
            onClick={clearHistory}
          >
            Clear history
          </button>
        </div>
        {history.length > 0 ? (
          history.map((s) => {
            return (
              <div className="w-full">
                <p className="text-gray-600">{s.query}</p>
              </div>
            );
          })
        ) : (
          <p className="text-gray-600">You have no recent searches</p>
        )}
        <Divider />
      </motion.div>
    </div>
  );
}
