import { useEffect, useState } from "react";
import Cookies from "universal-cookie";

import { useAppSelector, useAppDispatch } from "../hooks";
import { setPostCreateModal } from "../slice/modalSlice";
import { AUTH_TOKEN } from "../lib/cookie_names";
import Post from "../components/review/Post";
import PostLoader from "../components/loaders/PostLoader";
import ReviewModal from "../components/modal/ReviewModal";

export default function Feed() {
  const dispatch = useAppDispatch();
  const location = useAppSelector((state) => state.location);
  const user = useAppSelector((state) => state.user);

  const cookies = new Cookies(null, { path: "/" });
  const [reviews, setReviews] = useState<any>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviews(null);
        await new Promise((resolve) => setTimeout(resolve, 300));
        let url;

        url = `${import.meta.env.VITE_API_URL}/review?lat=${location.lat}&long=${location.long}`;
        const res = await fetch(url, {
          mode: "cors",
          headers: {
            authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
          },
        });
        const data = await res.json();
        if (data.status == "ok") {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-1">
      <ReviewModal />
      <div className="col-span-2 px-4">
        <div className="bg-white w-full h-fit px-6 py-3 mt-3 border rounded-md border-slate-200 flex items-center shadow-xl">
          <img
            src={user.profile_picture_url}
            style={{ height: "50px", width: "50px" }}
            className="rounded-full"
          />
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
            className="border border-gray-200 rounded-md h-9 text-sm"
          >
            <option>Recent</option>
            <option>Hot</option>
            <option>Random</option>
          </select>
        </div>
        {reviews == null ? (
          <>
            <div className="bg-white w-full h-fit px-6 py-3 mt-3 border rounded-md border-slate-200">
              <PostLoader />
            </div>
            <div className="bg-white w-full h-fit px-6 py-3 mt-3 border rounded-md border-slate-200">
              <PostLoader />
            </div>
          </>
        ) : (
          reviews.map((review: any) => <Post key={review.id} review={review} />)
        )}
      </div>
      <div className="col-span-1 w-full bg-white rounded-md mt-3 h-fit px-4 py-3 sticky top-4"></div>
    </div>
  );
}
