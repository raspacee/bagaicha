import { AiOutlineHeart } from "@react-icons/all-files/ai/AiOutlineHeart";
import { AiFillHeart } from "@react-icons/all-files/ai/AiFillHeart";
import { TfiComment } from "@react-icons/all-files/tfi/TfiComment";
import { IoCloseOutline } from "@react-icons/all-files/io5/IoCloseOutline";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Cookies from "universal-cookie";
import { motion } from "framer-motion";

import { useAppSelector, useAppDispatch } from "../../hooks";
import { closeReviewModal } from "../../slice/modalSlice";
import Comment from "../review/Comment";
import { AUTH_TOKEN } from "../../lib/cookie_names";

export default function ReviewModal() {
  const state = useAppSelector((state) => state.modal.reviewModal);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const cookies = new Cookies(null, {
    path: "/",
  });
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
              authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
            },
          },
        );
        const data = await res.json();
        setComments(data.comments);
      } catch (err) {
        console.log(err);
      }
    };
    if (state.display) fetchComments();
  }, [state]);

  const closeModal = () => {
    dispatch(closeReviewModal());
  };

  const submitComment = async () => {
    if (commentInput.trim() == "") {
      return;
    }

    try {
      let url: string;
      if (replyingToId) {
        url = `${import.meta.env.VITE_API_URL}/review/${state.reviewId}/comments/${replyingToId}`;
      } else {
        url = `${import.meta.env.VITE_API_URL}/review/${state.reviewId}/comments`;
      }
      const res = await fetch(url, {
        method: "post",
        mode: "cors",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
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
        if (replyingToId != null) {
          setComments((prev) => {
            if (prev == null) return null;

            for (let i = 0; i < prev.length; i++) {
              if (prev[i].id == replyingToId && prev[i].replies)
                prev[i].replies.push(data.reply);
              else if (prev[i].id == replyingToId)
                prev[i].replies = [data.reply];
            }
            return prev;
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
        `${import.meta.env.VITE_API_URL}/review/${reviewId}/comments/${commentId}`,
        {
          method: "get",
          mode: "cors",
          headers: {
            authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
          },
        },
      );
      const data = await res.json();
      setComments((prev) => {
        return prev!.map((c) => {
          if (c.id == commentId) c.replies = data.replies;
          return c;
        });
      });
    } catch (err) {
      console.log(err);
    }
  };

  if (!state.display) {
    return null;
  }
  return (
    <div className="fixed top-0 left-0 z-50 w-screen h-screen bg-black bg-opacity-80 flex justify-center items-center">
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-md w-4/5 h-[90%] grid grid-cols-2"
      >
        <div className="col-span-1 h-full">
          <img
            src={state.reviewImageUrl}
            style={{ width: "100%", height: "100%" }}
            className="object-cover"
          />
        </div>
        <div className="col-span-1 h-full">
          <div className="flex h-14 items-center justify-between px-2 py-1">
            <div className="flex items-center">
              <img
                src={state.authorImageUrl}
                style={{ width: "40px", height: "40px" }}
                className="rounded-full"
              />
              <Link to={`/user/${state.authorEmail}`}>
                <p className="ml-2 font-medium">{state.authorName}</p>
              </Link>
            </div>
            <div className="flex items-center">
              <p className="font-regular text-gray-600">{state.createdAt}</p>
              <IoCloseOutline
                size={28}
                className="ml-1 cursor-pointer"
                onClick={closeModal}
              />
            </div>
          </div>
          <div className="border-t px-2 py-1 h-[480px] overflow-y-scroll">
            <p className="">{state.reviewBody}</p>
            <div className="border-t-2 my-2 z-50 h-full">
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
          <div className="border-t h-14">
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
      </motion.div>
    </div>
  );
}
