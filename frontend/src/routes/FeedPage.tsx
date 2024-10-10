import FavoriteIcon from "@mui/icons-material/Favorite";
import { useSearchParams } from "react-router-dom";
import { useAppSelector } from "../hooks";
import Post from "../components/post/Post";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetchMyFeed } from "@/api/PostApi";
import CreatePostDialog from "@/components/post/CreatePostDialog";
import { useState } from "react";
import React from "react";
import { Button } from "@/components/ui/button";

export default function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useAppSelector((state) => state.location);
  const sortByInitialValue = searchParams.get("sort") || "trending";
  const [sortBy, setSortBy] = useState<string>(sortByInitialValue);

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useFetchMyFeed(sortBy, location);

  return (
    <div className="w-full flex flex-col md:flex-row">
      <div className="px-1 md:px-4 flex-1">
        <div className="bg-white h-fit px-1 md:px-6 py-3 border rounded-md border-slate-200 flex items-center shadow">
          <CreatePostDialog />
        </div>
        <div className="w-full flex justify-end my-1 items-center">
          <Select
            onValueChange={(value) => {
              setSearchParams({ sort: value });
              setSortBy(value);
            }}
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
        <div className="w-full flex flex-col items-center">
          <div className="w-full md:w-[70%]">
            {data &&
              data.pages.map((group, i) => (
                <React.Fragment key={i}>
                  {group.posts.map((post) => (
                    <Post key={post.id} post={post} renderedFromFeed={true} />
                  ))}
                </React.Fragment>
              ))}
          </div>
        </div>
        <div className="flex flex-col items-center mb-5">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage || !hasNextPage}
            style={{ overflowAnchor: "none" }}
          >
            {isFetchingNextPage
              ? "Fetching more..."
              : hasNextPage
              ? "Load More"
              : "Nothing to load"}
          </Button>
        </div>
        {data && data.pages.length == 0 && (
          <div className="card lg:card-side bg-base-100 shadow-xl">
            <div className="h-[10rem] w-full flex justify-center items-center">
              <p className="text-xl font-bold">
                No posts found, start creating them!
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-md h-fit px-4 py-3 top-4 mr-2 shadow">
        <p className="font-medium text-gray-700">
          Made by <a href="https://bijaykhapung.com.np/">raspace</a> with{" "}
          <FavoriteIcon style={{ color: "red" }} />
        </p>
        <p className="text-sm font-medium text-gray-700">
          &copy; 2024 bagaicha. All rights reserved.
        </p>
      </div>
    </div>
  );
}
