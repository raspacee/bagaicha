import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import "react-loading-skeleton/dist/skeleton.css";

import Post from "../components/post/Post";
import { useGetUserData, useGetUserPosts } from "@/api/UserApi";
import { Button } from "@/components/ui/button";

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const {
    user,
    isLoading: isUserLoading,
    isSuccess: isUserSuccess,
  } = useGetUserData(userId as string);
  const {
    posts,
    isLoading: isPostsLoading,
    setEnabled: setPostQueryEnabled,
  } = useGetUserPosts(userId as string);

  useEffect(() => {
    if (isUserSuccess) {
      setPostQueryEnabled(true);
    }
  }, [isUserSuccess]);

  if (isUserLoading) {
    return <h1>Loading...</h1>;
  }

  if (user == null) {
    return (
      <div className="">
        <h1>User not found</h1>
      </div>
    );
  }
  return (
    <div className="w-full md:w-[70%] gap-3 flex flex-col ">
      <div className="w-full flex flex-col gap-4 bg-white py-6 px-2 shadow rounded-lg">
        <div className="w-full flex flex-col md:flex-row gap-6 justify-center items-center">
          <div>
            <img
              src={`${user.profilePictureUrl}`}
              alt="Profile picture"
              className="h-[7rem] w-[7rem] rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="font-bold text-xl">
              {user.firstName + " " + user.lastName}
            </h1>
            <p className="text-sm text-gray-600 font-medium">
              Joined on {DateTime.fromISO(user.createdAt).toFormat("DDD")}
            </p>
            {user.id == userId && (
              <Button
                variant="outline"
                onClick={() => navigate("/user/edit-profile")}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
        <div className="flex justify-center items-center">
          {user.bio ? user.bio : "User has not written any bio"}
        </div>
      </div>
      <div className="bg-white w-full flex flex-col gap-3 items-center py-5 px-3 rounded-md">
        <h1 className="text-lg font-medium">User's Activity</h1>
        {isPostsLoading && <h1>Loading...</h1>}
        {posts?.length == 0 ? (
          <h1>No posts</h1>
        ) : (
          <div className="w-full md:w-[80%]">
            {posts?.map((post) => (
              <Post key={post.id} post={post} renderedFromFeed={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
