import { HiOutlineDotsHorizontal } from "@react-icons/all-files/hi/HiOutlineDotsHorizontal";
import { BsBookmarkDash } from "@react-icons/all-files/bs/BsBookmarkDash";
import { BsBookmarkDashFill } from "@react-icons/all-files/bs/BsBookmarkDashFill";
import { AiFillHeart } from "@react-icons/all-files/ai/AiFillHeart";
import { AiOutlineHeart } from "@react-icons/all-files/ai/AiOutlineHeart";

import RatingStar from "../place/RatingStar";
import { useBookmark } from "../../hooks/useBookmark";
import { useLike } from "../../hooks/useLike";
import { useAppDispatch } from "../../hooks";
import { setImgModal } from "../../slice/modalSlice";

import { DateTime } from "luxon";
import { Link } from "react-router-dom";

export default function Bookmark({ bookmark }: { bookmark: any }) {
  const dispatch = useAppDispatch();
  const [hasBookmarked, callBookmarkHandler] = useBookmark(
    true,
    bookmark.review_id,
  );
  const [hasLiked, likeHandler] = useLike(
    bookmark.has_liked,
    bookmark.review_id,
  );

  return (
    <div className="w-full bg-white rounded-md shadow-xl my-3 py-3 px-3">
      <div className="grid grid-cols-2">
        <div className="col-span-1">
          <div className="flex">
            <RatingStar size={20} filled={parseInt(bookmark.rating)} />
            <Link to={`/user/${bookmark.author_email}`}>
              <span className="ml-1 text-sm text-gray-700">
                {bookmark.author_name}
              </span>
            </Link>
          </div>
        </div>
        <div className="col-span-1">
          <div className="flex justify-end">
            <span className="mr-2 text-sm text-gray-700">
              {DateTime.fromISO(bookmark.created_at).toRelative()}
            </span>
            <HiOutlineDotsHorizontal size={20} className="mr-4" />
          </div>
        </div>
      </div>
      <div className="my-1">
        <p className="text-sm">{bookmark.body}</p>
      </div>
      <div className="my-2">
        <img
          src={bookmark.picture}
          width="200"
          height="150"
          alt="Food picture"
          className="rounded-md cursor-pointer"
          onClick={() =>
            dispatch(
              setImgModal({
                value: true,
                src: bookmark.picture,
              }),
            )
          }
        />
      </div>

      <div className="h-fit flex items-center">
        <div className="mx-2">
          {hasLiked ? (
            <AiFillHeart
              size={30}
              className="cursor-pointer"
              onClick={() => likeHandler()}
              fill="red"
            />
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
            <BsBookmarkDashFill
              size={25}
              className="cursor-pointer"
              onClick={() => callBookmarkHandler()}
            />
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
}
