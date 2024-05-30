import { AiOutlineHeart } from "@react-icons/all-files/ai/AiOutlineHeart";
import { AiFillHeart } from "@react-icons/all-files/ai/AiFillHeart";
import { BsDot } from "@react-icons/all-files/bs/BsDot";
import { BsBookmarkDash } from "@react-icons/all-files/bs/BsBookmarkDash";
import { BsBookmarkDashFill } from "@react-icons/all-files/bs/BsBookmarkDashFill";
import ForumIcon from "@mui/icons-material/Forum";

import { Link } from "react-router-dom";
import { DateTime } from "luxon";
import { motion } from "framer-motion";
import Tooltip from "@mui/material/Tooltip";

import { haversine } from "../../lib/helpers";
import { useAppSelector, useAppDispatch } from "../../hooks";
import { setImgModal, openReviewModal } from "../../slice/modalSlice";
import { useBookmark } from "../../hooks/useBookmark";
import { useLike } from "../../hooks/useLike";

export default function Post({ review }: { review: any }) {
  const location = useAppSelector((state) => state.location);
  const dispatch = useAppDispatch();
  const isLocationGranted = location.lat != -1 && location.long != -1;

  const [hasLiked, likeHandler] = useLike(review.user_has_liked, review.id);
  const [hasBookmarked, bookmarkHandler] = useBookmark(
    review.user_has_bookmarked_review,
    review.id,
  );

  const date = DateTime.fromISO(review.created_at);

  const openReview = (
    reviewId: string,
    reviewImageUrl: string,
    authorName: string,
    authorImageUrl: string,
    createdAt: string,
    reviewBody: string,
    authorEmail: string,
    placeName: string,
    placeId: string,
    rating: number,
  ) => {
    dispatch(
      openReviewModal({
        reviewId,
        reviewImageUrl,
        authorName,
        authorImageUrl,
        createdAt,
        reviewBody,
        authorEmail,
        placeName,
        placeId,
        rating,
      }),
    );
  };

  return (
    <div className="bg-white w-full h-fit px-6 py-3 mb-3 border rounded-md border-slate-200">
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
        <BsDot className="ml-0.5" size={20} />
        <span className="ml-0.5 font-normal text-sm text-gray-500">
          {" "}
          {date.toRelative()}
        </span>
        <BsDot className="ml-0.5" size={20} />
        <span className="ml-0.5 text-sm font-normal text-gray-500">{`${review.first_name} rated the food ${review.rating} star`}</span>
      </div>{" "}
      <div className="border-t mt-2 pt-1 flex items-center">
        at{" "}
        <Link to={`/place/${review.place_id}`}>
          <span className="font-semibold ml-1">{review.name}</span>
        </Link>
        {isLocationGranted && (
          <>
            <BsDot className="ml-0.5" size={20} />
            <span className="ml-0.5 text-sm font-normal text-gray-500">{`${haversine(
              location.lat,
              location.long,
              review.lat,
              review.long,
            )} km away from you`}</span>
          </>
        )}
      </div>
      <div className="mt-2">
        <Tooltip title="Open image">
          <img
            src={`${review.picture}`}
            alt="Food picture"
            onClick={() =>
              dispatch(
                setImgModal({
                  value: true,
                  src: review.picture,
                }),
              )
            }
            className="w-4/5 h-[20rem] object-cover cursor-pointer"
          />
        </Tooltip>
      </div>
      <div className="my-3">
        <p>{review.body}</p>
      </div>
      <div className="border-t-2 my-2"></div>
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
          <span
            onClick={() => {
              openReview(
                review.id,
                review.picture,
                review.first_name + " " + review.last_name,
                review.profile_picture_url,
                date.toRelative()!,
                review.body,
                review.email,
                review.name,
                review.place_id,
                parseInt(review.rating),
              );
            }}
            className="cursor-pointer"
          >
            <ForumIcon style={{ fontSize: 25 }} />
          </span>
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
            {`${review.like_count} people love this review`}
          </span>
        )}
      </div>
    </div>
  );
}
