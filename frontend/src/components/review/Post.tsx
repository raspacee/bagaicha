import { AiOutlineHeart } from "@react-icons/all-files/ai/AiOutlineHeart";
import { AiFillHeart } from "@react-icons/all-files/ai/AiFillHeart";
import { BsDot } from "@react-icons/all-files/bs/BsDot";
import { BsBookmarkDash } from "@react-icons/all-files/bs/BsBookmarkDash";
import { BsBookmarkDashFill } from "@react-icons/all-files/bs/BsBookmarkDashFill";

import { Link } from "react-router-dom";
import { DateTime } from "luxon";
import { motion } from "framer-motion";

import { haversine } from "../../lib/helpers";
import { useAppSelector, useAppDispatch } from "../../hooks";
import { setImgModal } from "../../slice/modalSlice";
import { useBookmark } from "../../hooks/useBookmark";
import { useLike } from "../../hooks/useLike";
import { MapPinHouse } from "lucide-react";
import PostComments from "./PostComments";

export default function Post({ review }: { review: any }) {
  const location = useAppSelector((state) => state.location);
  const dispatch = useAppDispatch();
  const isLocationGranted = location.lat != -1 && location.long != -1;

  const [hasLiked, likeHandler] = useLike(review.user_has_liked, review.id);
  const [hasBookmarked, bookmarkHandler] = useBookmark(
    review.user_has_bookmarked_review,
    review.id
  );

  const date = DateTime.fromISO(review.created_at);

  return (
    <div className="bg-white w-full h-fit px-1 md:px-6 py-3 mb-3 border rounded-md border-slate-200">
      <div className="flex flex-col md:flex-row justify-between md:items-center">
        <div className="flex items-center">
          <img
            src={review.profile_picture_url}
            alt="User profile picture"
            className="rounded-full h-11 w-11 object-cover"
            width="100"
            height="100"
          />
          <Link to={`/user/${review.email}`}>
            <p className="ml-2">{`${review.first_name} ${review.last_name}`}</p>
          </Link>
        </div>
        <div className="flex">
          <div className="flex">
            <span className="ml-0.5 font-normal text-sm text-gray-500">
              {date.toRelative()}
            </span>
          </div>
          <div className="flex">
            <BsDot className="ml-0.5" size={20} />
            <span className="ml-0.5 text-sm font-normal text-gray-500">{`${review.first_name} rated the food ${review.rating} star`}</span>
          </div>
        </div>
      </div>
      <div className="border-t mt-2 pt-1 flex md:items-center flex-col md:flex-row gap-3">
        <Link to={`/place/${review.place_id}`}>
          at <span className="font-semibold">{review.name}</span>
        </Link>
        {isLocationGranted && (
          <div className="flex">
            <BsDot className="hidden md:block" size={20} />
            <MapPinHouse className="block md:hidden" />
            <span className="ml-0.5 text-sm font-normal text-gray-500">{`${haversine(
              location.lat,
              location.long,
              review.lat,
              review.long
            )} km away from you`}</span>
          </div>
        )}
      </div>
      <div className="mt-2 flex">
        <img
          src={`${review.picture}`}
          alt="Food picture"
          onClick={() =>
            dispatch(
              setImgModal({
                value: true,
                src: review.picture,
              })
            )
          }
          className="flex-1 h-[22rem] object-cover cursor-pointer"
        />
      </div>
      <div className="my-3">
        <p>{review.body}</p>
      </div>
      <div className="border-t-2 my-2"></div>
      <div className="flex items-center gap-3">
        <div className="">
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
        <div className="">
          <PostComments postId={review.id as string} />
        </div>
        <div className="">
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
                size={23}
                className="cursor-pointer"
                onClick={() => bookmarkHandler()}
              />
            </motion.div>
          ) : (
            <BsBookmarkDash
              size={23}
              className="cursor-pointer"
              onClick={() => bookmarkHandler()}
            />
          )}
        </div>
      </div>
      <div>
        {review.like_count != 0 && (
          <span className="text-sm font-medium ml-2 text-gray-800 select-none">
            {`${review.like_count} people love this post`}
          </span>
        )}
      </div>
    </div>
  );
}
