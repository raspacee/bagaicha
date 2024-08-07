import { HiOutlineDotsHorizontal } from "@react-icons/all-files/hi/HiOutlineDotsHorizontal";
import { BsBookmarkDash } from "@react-icons/all-files/bs/BsBookmarkDash";
import { BsBookmarkDashFill } from "@react-icons/all-files/bs/BsBookmarkDashFill";
import { AiFillHeart } from "@react-icons/all-files/ai/AiFillHeart";
import { AiOutlineHeart } from "@react-icons/all-files/ai/AiOutlineHeart";

import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { DateTime } from "luxon";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Cookies from "universal-cookie";
import Divider from "@mui/material/Divider";

import Post from "../components/post/Post";
import { AUTH_TOKEN_NAME } from "../lib/config";
import ReviewModal from "../components/modal/ReviewModal";

export default function Profile() {
  const { slug } = useParams();
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[] | null>(null);
  const cookies = new Cookies(null, {
    path: "/",
  });
  useEffect(() => {
    const fetchUser = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/user/${slug}`,
          {
            mode: "cors",
          }
        );
        const data = await res.json();
        if (data.status == "ok") {
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchActivity = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/user/${slug}/reviews`,
          {
            mode: "cors",
            headers: {
              authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
            },
          }
        );
        const data = await res.json();
        if (data.status == "ok") {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
    fetchActivity();
  }, [slug]);

  if (user == null) {
    return (
      <div className="grid grid-cols-3 gap-1">
        <div className="col-span-2 px-4 my-4">
          <div className="w-full bg-white py-2 px-3 rounded-md flex justify-center items-center">
            <Skeleton
              circle={true}
              width={100}
              height={100}
              style={{ marginRight: 20 }}
            />
            <div className="h-full">
              <Skeleton width={250} />
              <Skeleton width={250} />
              <Skeleton width={250} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        <div className="col-span-2 px-4 my-4">
          <div className="w-full bg-white py-2 px-3 rounded-md flex flex-col items-center shadow-lg">
            <div className="flex flex-row justify-around w-5/6">
              <div>
                <img
                  src={`${user.profile_picture_url}`}
                  alt="Profile picture"
                  className="h-32 w-32 rounded-full object-cover"
                  width="200"
                  height="200"
                />
              </div>
              <div className="mx-10 pt-3">
                <span className="flex my-2 items-center">
                  <p className="font-medium text-xl mr-7 cursor-pointer">{`${user.first_name} ${user.last_name}`}</p>
                  <Link to="/user/edit-profile">
                    <button className="btn btn-primary">Edit Profile</button>
                  </Link>
                </span>
                <h2 className="my-1">{user.email}</h2>
                <h2 className="text-sm text-gray-600">
                  Joined on {DateTime.fromISO(user.created_at).toFormat("DDD")}
                </h2>
              </div>
            </div>
            <div className="col-span-2 min-h-14 w-full text-center mt-3">
              <p className="text-gray-600 font-medium">
                {user.bio ? user.bio : "User has not written any bio"}
              </p>
            </div>
          </div>
          <div className="w-full bg-white my-2 py-2 px-3 rounded-md min-h-[300px] shadow-lg">
            <h2 className="text-xl font-medium text-center w-full mb-3">
              User's activity
            </h2>
            {reviews == null ? (
              <div className="w-full h-[250px] flex justify-center items-center">
                <p className="text-gray-600 font-medium">User has no posts</p>
              </div>
            ) : (
              <div>
                {reviews.map((review) => {
                  return <Post key={review.id} review={review} />;
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
