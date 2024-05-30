import { AiOutlineHeart } from "@react-icons/all-files/ai/AiOutlineHeart";
import { AiFillHeart } from "@react-icons/all-files/ai/AiFillHeart";

import { useState } from "react";
import { DateTime } from "luxon";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import Divider from "@mui/material/Divider";

import { useAppDispatch } from "../../hooks";
import { closeReviewModal } from "../../slice/modalSlice";
import { AUTH_TOKEN } from "../../lib/cookie_names";

export default function Comment({
  comment,
  replyHandler,
  isReplyComment,
  fetchReplies,
}: {
  comment: any;
  replyHandler: (replyingToId: string, replyingToName: string) => void;
  isReplyComment: boolean;
  fetchReplies?: (reviewId: string, commentId: string) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [hasLiked, setHasLiked] = useState<boolean>(comment.user_has_liked);
  const cookies = new Cookies(null, {
    path: "/",
  });
  const [replies, setReplies] = useState<any[] | undefined>(comment.replies);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const likeHandler = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/review/${comment.review_id}/comments/${comment.id}/like`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
        },
      },
    );
    const message = await response.json();
    if (message.status == "ok") {
      if (message.action == "like") {
        setHasLiked(true);
      } else {
        setHasLiked(false);
      }
    }
  };

  return (
    <>
      <div className={`px-1 py-1 ${isReplyComment ? "ml-3" : ""}`}>
        <div className="flex justify-between">
          <div className="flex items-center">
            <img
              src={comment.author_picture_url}
              style={{ width: "40px", height: "40px" }}
              className="rounded-full object-cover"
            />
            <button
              className="ml-2 font-medium"
              onClick={() => {
                dispatch(closeReviewModal());
                navigate(`/user/${comment.author_email}`);
              }}
            >
              {comment.author_name}
            </button>
          </div>
          <div>
            <p className="text-gray-600">
              {DateTime.fromISO(comment.created_at).toRelative()}
            </p>
          </div>
        </div>
        <div className="">
          <p>{comment.body}</p>
          <div className="flex mt-1">
            {!hasLiked ? (
              <AiOutlineHeart
                size={25}
                className="cursor-pointer"
                onClick={likeHandler}
              />
            ) : (
              <AiFillHeart
                size={25}
                fill="red"
                className="cursor-pointer"
                onClick={likeHandler}
              />
            )}
            {comment.like_count > 0 && (
              <p className="text-gray-600 mx-2">{comment.like_count} like</p>
            )}
            <button
              className="font-medium text-blue-700 mx-2"
              onClick={() => {
                replyHandler(comment.id, comment.author_name);
              }}
            >
              Reply
            </button>
          </div>
        </div>
        {comment.replies && showReplies && !isReplyComment && (
          <p
            className="font-medium text-gray-500 cursor-pointer select-none text-sm"
            onClick={() => setShowReplies(false)}
          >
            Hide replies
          </p>
        )}
        {comment.replies && !showReplies && !isReplyComment && (
          <p
            className="font-medium text-gray-500 cursor-pointer select-none text-sm"
            onClick={() => {
              setShowReplies(true);
              fetchReplies!(comment.review_id, comment.id);
            }}
          >
            View replies
          </p>
        )}
        {showReplies &&
          !isReplyComment &&
          comment.replies &&
          comment.replies.map((r: any) => (
            <Comment
              key={r.id}
              comment={r}
              replyHandler={() => replyHandler(comment.id, r.author_name)}
              isReplyComment={true}
            />
          ))}
      </div>
      <Divider />
    </>
  );
}
