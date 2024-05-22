import { HiOutlineDotsHorizontal } from "@react-icons/all-files/hi/HiOutlineDotsHorizontal";

import { DateTime } from "luxon";

import RatingStar from "./RatingStar";
import { useAppDispatch } from "../../hooks";
import { setImgModal } from "../../slice/modalSlice";

export default function RatingReview({ review }) {
  const dispatch = useAppDispatch();
  const date = DateTime.fromISO(review.created_at);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2">
        <div className="col-span-1">
          <div className="flex">
            <RatingStar size={20} filled={parseInt(review.rating)} />
            <span className="ml-1 text-sm text-gray-700">
              {review.author_name}
            </span>
          </div>
        </div>
        <div className="col-span-1">
          <div className="flex justify-end">
            <span className="mr-2 text-sm text-gray-700">
              {date.toRelative()}
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
          className="rounded-md cursor-pointer"
          onClick={() =>
            dispatch(setImgModal({ value: true, src: review.picture }))
          }
        />
      </div>
    </div>
  );
}
