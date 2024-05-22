import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { DateTime } from "luxon";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Profile() {
  const { slug } = useParams();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/user/${slug}`,
          {
            mode: "cors",
          },
        );
        const data = await res.json();
        if (data.status == "ok") {
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
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
          <div className="w-full bg-white py-2 px-3 rounded-md flex justify-center">
            <div className="flex flex-row justify-around w-3/4 ">
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
                    <span className="bg-gray-200 py-2 px-3 rounded-md">
                      Edit profile
                    </span>
                  </Link>
                </span>
                <h2 className="my-1">{user.email}</h2>
                <h2 className="text-sm text-gray-600">
                  Joined on {DateTime.fromISO(user.created_at).toFormat("DDD")}
                </h2>
              </div>
            </div>
          </div>
          <div className="w-full bg-white my-2 py-2 px-3 rounded-md flex justify-center">
            <h2>User's activity</h2>
          </div>
        </div>
      </div>
    </>
  );
}
