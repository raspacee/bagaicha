import { AiOutlineHeart } from "@react-icons/all-files/ai/AiOutlineHeart";
import { AiFillHeart } from "@react-icons/all-files/ai/AiFillHeart";
import { TfiComment } from "@react-icons/all-files/tfi/TfiComment";
import { IoCloseOutline } from "@react-icons/all-files/io5/IoCloseOutline";
import PlaceIcon from "@mui/icons-material/Place";

import { useState, useEffect, useRef, forwardRef, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Cookies from "universal-cookie";
import { motion } from "framer-motion";
import Rating from "@mui/material/Rating";
import Divider from "@mui/material/Divider";

import { useAppSelector, useAppDispatch } from "../../hooks";
import Comment from "../post/Comment";
import { AUTH_TOKEN_NAME } from "../../lib/config";

const ReviewModal = forwardRef<HTMLDialogElement, {}>((props, ref) => {
  const state = useAppSelector((state) => state.modal.reviewModal);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const cookies = new Cookies(null, {
    path: "/",
  });
  const navigate = useNavigate();
  const [comments, setComments] = useState<any[] | null>(null);
  const [commentInput, setCommentInput] = useState<string>("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyingToName, setReplyingToName] = useState<string | null>(null);

  const commentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/review/${state.reviewId}/comments`,
          {
            method: "get",
            mode: "cors",
            headers: {
              authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
            },
          }
        );
        const data = await res.json();
        setComments(data.comments);
      } catch (err) {
        console.log(err);
      }
    };
    fetchComments();
  }, [state]);

  const submitComment = async () => {
    if (commentInput.trim() == "") {
      return;
    }

    try {
      let url: string;
      if (replyingToId) {
        url = `${import.meta.env.VITE_API_URL}/review/${
          state.reviewId
        }/comments/${replyingToId}`;
      } else {
        url = `${import.meta.env.VITE_API_URL}/review/${
          state.reviewId
        }/comments`;
      }
      const res = await fetch(url, {
        method: "post",
        mode: "cors",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          author_id: user.user_id,
          comment_body: commentInput,
        }),
      });
      const data = await res.json();
      if (data.status == "ok") {
        clearCommentInput();
        console.log(data);
        if (replyingToId != null) {
          setComments((prev) => {
            if (prev == null) return null;

            return prev.map((comment) => {
              if (comment.id == replyingToId && comment.replies) {
                return {
                  ...comment,
                  replies: [...comment.replies, data.reply],
                };
              } else if (comment.id == replyingToId && !comment.replies) {
                return {
                  ...comment,
                  replies: [data.reply],
                };
              }
              return comment;
            });
          });
          setReplyingToId(null);
          setReplyingToName(null);
        } else {
          setComments((prev) => {
            if (prev == null) return [data.comment];
            return [data.comment, ...prev];
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const clearCommentInput = () => {
    setCommentInput("");
  };

  const replyHandler = (replyingToId: string, replyingToName: string) => {
    setCommentInput("");
    setReplyingToName(replyingToName);
    setReplyingToId(replyingToId);
    commentInputRef.current?.focus();
  };

  const fetchReplies = async (reviewId: string, commentId: string) => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/review/${reviewId}/comments/${commentId}`,
        {
          method: "get",
          mode: "cors",
          headers: {
            authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
          },
        }
      );
      const data = await res.json();
      setComments((prev) => {
        if (!prev) return prev;
        return prev.map((c) => {
          if (c.id === commentId) {
            return { ...c, replies: data.replies };
          }
          return c;
        });
      });
      console.log(comments);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <dialog id="my_modal_4" className="modal" ref={ref}>
      <div className="modal-box w-11/12 max-w-5xl grid grid-cols-2 p-0 h-[40rem] overflow-clip">
        <div className="col-span-1 h-full">
          <img
            src={state.reviewImageUrl}
            className="object-cover h-full"
            style={{ height: "100%" }}
          />
        </div>
        <div className="col-span-1 grid grid-rows-12">
          <div className="flex items-center justify-between px-2 py-1 row-span-2">
            <div className="flex items-center">
              <img
                src={state.authorImageUrl}
                style={{ width: "40px", height: "40px" }}
                className="rounded-full object-cover"
              />
              <button
                className="ml-2 font-medium"
                onClick={() => {
                  navigate(`/user/${state.authorEmail}`);
                }}
              >
                {state.authorName}
              </button>
            </div>
            <div className="flex items-center">
              <p className="font-regular text-gray-600">{state.createdAt}</p>
              <form method="dialog">
                <button className="btn btn-ghost">
                  <IoCloseOutline size={28} className="ml-1 cursor-pointer" />
                </button>
              </form>
            </div>
          </div>

          <div className="border-t px-2 py-1 row-span-7 overflow-y-scroll">
            <div className="flex justify-between items-center">
              <span>
                <PlaceIcon fontSize="large" style={{ color: "#239B56" }} />
                <Link to={"/place/" + state.placeId}>
                  <span className="font-bold">{state.placeName}</span>
                </Link>
              </span>
              <Rating
                name="half-rating-read"
                value={state.rating}
                precision={0.5}
                readOnly
              />
            </div>
            <p className="mb-2">{state.reviewBody}</p>
            <Divider />
            <div className="my-2 z-50 h-full">
              {comments == null ? (
                <h1>No comments on here...</h1>
              ) : (
                comments.map((c) => (
                  <Comment
                    key={c.id + c.body}
                    comment={c}
                    replyHandler={replyHandler}
                    isReplyComment={false}
                    fetchReplies={fetchReplies}
                  />
                ))
              )}
            </div>
          </div>
          <div className="border-t row-span-3">
            <div className="flex items-center px-2 py-1">
              <AiOutlineHeart size={32} />
              <TfiComment size={25} className="mx-2" />
            </div>
            <div className="px-2 py-1">
              <input
                type="text"
                placeholder={
                  replyingToName == null
                    ? "Type a comment"
                    : `Replying to ${replyingToName}`
                }
                className="focus:outline-none focus:ring-0 rounded-full"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                ref={commentInputRef}
              />
              <motion.button
                whileTap={{
                  scale: 0.95,
                }}
                onClick={submitComment}
                className="px-4 py-1 border ml-2 rounded-full bg-blue-600 text-white font-medium"
              >
                Post
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
});

export default ReviewModal;
