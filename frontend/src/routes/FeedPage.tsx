import FavoriteIcon from "@mui/icons-material/Favorite";

import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@mui/material/Avatar";

import { useAppSelector, useAppDispatch } from "../hooks";
import { setPostCreateModal } from "../slice/modalSlice";
import Post from "../components/review/Post";
import PostLoader from "../components/loaders/PostLoader";
import { fetchReviews } from "../api/reviewApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetchMyFeed } from "@/api/PostApi";
import { z } from "zod";
import CreatePostDialog from "@/components/review/CreatePostDialog";

export default function FeedPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useAppSelector((state) => state.location);
  const sortBy = searchParams.get("sort") || "trending";

  const { posts, isLoading } = useFetchMyFeed(sortBy, location);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="w-full flex flex-col md:flex-row">
      <div className="px-1 md:px-4 flex-1">
        <div className="bg-white h-fit px-6 py-3 mt-3 border rounded-md border-slate-200 flex items-center shadow-xl">
          <Avatar alt={user.first_name} src={user.profile_picture_url} />
          <div className="flex-1 ml-3">
            <CreatePostDialog />
          </div>
        </div>
        <div className="w-full flex justify-end my-1 items-center">
          <Select
            onValueChange={(value) => setSearchParams({ sort: value })}
            value={searchParams.get("sort") || "trending"}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort Posts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
            </SelectContent>
          </Select>
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
        {posts && posts.map((post) => <Post key={post.id} post={post} />)}
        {posts && posts.length == 0 && (
          <div className="card lg:card-side bg-base-100 shadow-xl">
            <div className="h-[10rem] w-full flex justify-center items-center">
              <p className="text-xl font-bold">
                No posts found, start creating them!
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-md mt-3 h-fit px-4 py-3 top-4 mr-2 shadow-lg">
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
