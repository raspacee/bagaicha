import { IoSadOutline } from "@react-icons/all-files/io5/IoSadOutline";

import { useState, useEffect } from "react";
import Cookies from "universal-cookie";

import { AUTH_TOKEN } from "../lib/cookie_names";
import Bookmark from "../components/bookmark/Bookmark";
import useFetch from "../hooks/useFetch";
import { FetchState } from "../lib/enums";
import { FetchOptionType } from "../lib/types";
import BookmarkLoader from "../components/loaders/BookmarkLoader";

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<any>(null);
  const [fetchState, fetchHook, fetchErr] = useFetch();
  const cookies = new Cookies(null, {
    path: "/",
  });

  useEffect(() => {
    const fetchBookmarks = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const options: FetchOptionType = {
        method: "get",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
        },
      };
      const data = await fetchHook(
        `${import.meta.env.VITE_API_URL}/review/bookmark/`,
        options,
      );
      setBookmarks(data.bookmarks);
    };

    fetchBookmarks();
  }, []);

  if (fetchState == FetchState.FETCHING) {
    return (
      <div className="grid grid-cols-3 gap-1 px-4">
        <div className="col-span-2">
          <BookmarkLoader />
          <BookmarkLoader />
        </div>
      </div>
    );
  }

  if (fetchState == FetchState.ERROR) {
    return (
      <div className="grid grid-cols-3 gap-1 px-4 h-fit">
        <div className="w-full bg-white mt-3 rounded-lg shadow-xl h-full flex flex-col justify-center items-center col-span-2 py-20">
          <div className="flex flex-col items-center">
            <IoSadOutline size={100} />
            <p className="my-2 text-2xl font-bold">
              Oh no! something went wrong!
            </p>
          </div>
          <p className="font-regular">{fetchErr?.toString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 px-4">
      <div className="col-span-2">
        <div className="w-full bg-white py-3 px-3 my-3 flex justify-center rounded-lg shadow-lg">
          <p className="font-bold text-2xl">Bookmarks</p>
        </div>
        <div>
          {bookmarks.map((bookmark: any) => (
            <Bookmark bookmark={bookmark} key={bookmark.review_id} />
          ))}
        </div>
      </div>
    </div>
  );
}
