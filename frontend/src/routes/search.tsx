import { HiOutlineDotsHorizontal } from "@react-icons/all-files/hi/HiOutlineDotsHorizontal";
import { BsBookmarkDash } from "@react-icons/all-files/bs/BsBookmarkDash";
import { BsBookmarkDashFill } from "@react-icons/all-files/bs/BsBookmarkDashFill";
import { AiFillHeart } from "@react-icons/all-files/ai/AiFillHeart";
import { AiOutlineHeart } from "@react-icons/all-files/ai/AiOutlineHeart";

import { useSearchParams, Link } from "react-router-dom";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { DateTime } from "luxon";
import { motion } from "framer-motion";

import RatingStar from "../components/place/RatingStar";
import { useAppDispatch } from "../hooks";
import { place_features } from "./edit_place";
import { useBookmark } from "../hooks/useBookmark";
import { useLike } from "../hooks/useLike";
import { setImgModal } from "../slice/modalSlice";
import { AUTH_TOKEN } from "../lib/cookie_names";

const ReviewSearchResult = ({ review }: { review: any }) => {
  const dispatch = useAppDispatch();
  const [hasBookmarked, callBookmarkHandler] = useBookmark(false, review.id);
  const [hasLiked, likeHandler] = useLike(review.has_liked, review.id);

  return (
    <div className="w-full bg-white rounded-md my-3 py-3 px-3">
      <div className="grid grid-cols-2">
        <div className="col-span-1">
          <div className="flex">
            <RatingStar size={20} filled={parseInt(review.rating)} />
            <Link to={`/user/${review.email}`}>
              <span className="ml-1 text-sm text-gray-700">
                {review.first_name} {review.last_name}
              </span>
            </Link>
          </div>
        </div>
        <div className="col-span-1">
          <div className="flex justify-end">
            <span className="mr-2 text-sm text-gray-700">
              {DateTime.fromISO(review.created_at).toRelative()}
            </span>
            <HiOutlineDotsHorizontal size={20} className="mr-4" />
          </div>
        </div>
      </div>
      <div className="my-1">
        <p className="text-sm">{review.body}</p>
      </div>
      <div className="my-2">
        <img
          src={review.picture}
          width="200"
          height="150"
          alt="Food picture"
          className="rounded-md cursor-pointer shadow-lg"
          onClick={() =>
            dispatch(
              setImgModal({
                value: true,
                src: review.picture,
              }),
            )
          }
        />
      </div>

      <div className="h-fit flex items-center">
        <div className="mx-2">
          {hasLiked ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              <AiFillHeart
                size={30}
                className="cursor-pointer"
                onClick={() => likeHandler()}
                fill="red"
              />
            </motion.div>
          ) : (
            <AiOutlineHeart
              size={30}
              className="cursor-pointer"
              onClick={() => likeHandler()}
            />
          )}
        </div>
        <div className="mx-2">
          {hasBookmarked ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              <BsBookmarkDashFill
                size={25}
                className="cursor-pointer"
                onClick={() => callBookmarkHandler()}
              />
            </motion.div>
          ) : (
            <BsBookmarkDash
              size={25}
              className="cursor-pointer"
              onClick={() => callBookmarkHandler()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const PlaceSearchResult = ({ place }: { place: any }) => {
  const handleBrokenImg = (e: any) => {
    e.target.src = "https://www.usm.edu/images/image-not-available_1.jpg";
  };
  const img: string = place.thumbnail_img_url || place.cover_img_url;
  console.log(place);
  console.log("img", img);
  return (
    <Link to={`/place/${place.id}`}>
      <div className="px-4 py-3 my-3 bg-white rounded-md grid gap-1 grid-cols-3 h-fit cursor-pointer">
        <div className="col-span-1">
          <img
            src={img}
            onError={handleBrokenImg}
            className="w-full h-full rounded-md"
          />
        </div>
        <div className="col-span-2 px-4">
          <h2 className="font-medium text-xl">{place.name.split(",")[0]} </h2>
          <div className="flex items-center">
            <RatingStar size={25} filled={Math.round(place.avg_rating)} />
            <div className="mx-2">
              <span className="font-medium">
                {Number(place.avg_rating).toFixed(2)}
              </span>
              <span className="font-light text-gray-600 ml-2">
                ({place.total_reviews} reviews)
              </span>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-gray-600">Opens 9:00 AM to 5:00 PM</p>
            <p className="text-gray-600">{place.name.split(",")[1]}</p>
          </div>
          <h2 className="font-medium mt-3">Offers</h2>
          <div className="mt-2">
            {place.place_features?.map((f: any, index: number) => {
              if (index == 3) return;
              const feature = place_features.find((data) => data.value == f);
              return (
                <span
                  key={feature?.label}
                  className="mr-2 font-light border px-3 py-2 rounded-md"
                >
                  {feature?.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") as string;
  const [value, setValue] = useState(0);
  const [places, setPlaces] = useState<any[] | null>(null);
  const [reviews, setReviews] = useState<any[] | null>(null);
  const cookies = new Cookies(null, {
    path: "/",
  });

  useEffect(() => {
    fetchSearch(q);
  }, [q]);

  const fetchSearch = async (q: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/search?q=${q}`, {
        mode: "cors",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
        },
      });
      const data = await res.json();
      setPlaces(data.places);
      setReviews(data.reviews);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className="bg-white shadow-lg min-h-screen px-4 py-3 m-3 mr-2 rounded-md">
      <p className="text-2xl font-bold text-gray-800">Search results for {q}</p>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="disabled tabs example"
      >
        <Tab label="Places" />
        <Tab label="Posts" />
      </Tabs>

      {value == 0 ? (
        <div className="w-3/4">
          {places != null ? (
            places.map((place: any) => <PlaceSearchResult place={place} />)
          ) : (
            <div className="flex w-full h-3/4 justify-center items-center">
              <p className="text-gray-600 text-xl font-medium">
                Nothing related found
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="w-3/4">
          {reviews != null ? (
            reviews.map((review: any) => <ReviewSearchResult review={review} />)
          ) : (
            <div className="flex w-full h-3/4 justify-center items-center">
              <p className="text-gray-600 text-xl font-medium">
                Nothing related found
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
