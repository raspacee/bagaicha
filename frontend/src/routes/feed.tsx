import FavoriteIcon from "@mui/icons-material/Favorite";

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@mui/material/Avatar";

import { useAppSelector, useAppDispatch } from "../hooks";
import { setPostCreateModal } from "../slice/modalSlice";
import Post from "../components/review/Post";
import PostLoader from "../components/loaders/PostLoader";
import { fetchReviews } from "../api/reviewApi";

export default function Feed() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "trending");
  const location = useAppSelector((state) => state.location);

  const {
    data: reviews,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useQuery({
    queryKey: ["reviews", sortBy],
    queryFn: () => fetchReviews(sortBy, location),
  });

  return (
    <div className="grid grid-cols-3 gap-1">
      <div className="col-span-2 px-4">
        <div className="bg-white w-full h-fit px-6 py-3 mt-3 border rounded-md border-slate-200 flex items-center shadow-xl">
          <Avatar alt={user.first_name} src={user.profile_picture_url} />
          <div className="w-full ml-3">
            <input
              className="w-full border bg-gray-200 border-gray-200 rounded-full cursor-pointer"
              placeholder="Post a review"
              onClick={() => dispatch(setPostCreateModal({ value: true }))}
            />
          </div>
        </div>
        <div className="w-full flex justify-end my-1 items-center">
          <label htmlFor="sort-by" className="mr-2 text-sm">
            Sort by
          </label>
          <select
            id="sort-by"
            className="select select-bordered w-[8rem] max-w-xs"
            onChange={(e) => {
              setSearchParams({ sort: e.target.value });
              setSortBy(e.target.value);
            }}
            value={sortBy}
          >
            <option value="trending">Trending</option>
            <option value="recent">Recent</option>
          </select>
        </div>
        {isLoading && (
          <>
            <div className="bg-white w-full h-fit px-6 py-3 mt-3 border rounded-md border-slate-200">
              <PostLoader />
            </div>
            <div className="bg-white w-full h-fit px-6 py-3 mt-3 border rounded-md border-slate-200">
              <PostLoader />
            </div>
          </>
        )}
        {isSuccess &&
          reviews &&
          reviews.map((review: any) => (
            <Post key={review.id} review={review} />
          ))}
        {isError && <div>Something went wrong, {error.message}</div>}
      </div>
      <div className="col-span-1  bg-white rounded-md mt-3 h-fit px-4 py-3 top-4 mr-2 shadow-lg">
        <p className="font-medium text-gray-700">
          Made by <a href="https://github.com/raspacee">raspace</a> with{" "}
          <FavoriteIcon style={{ color: "red" }} />
        </p>
        <p className="text-sm font-medium text-gray-700">
          &copy; 2024 bagaicha. All rights reserved.
        </p>
      </div>
    </div>
  );
}
