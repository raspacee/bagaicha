import { CommentForm } from "@/components/review/PostComments";
import { AUTH_TOKEN_NAME } from "@/lib/config";
import type { LocationType, Post, PostWithComments } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });

const BASE_API_URL = import.meta.env.VITE_API_URL;

const useFetchMyFeed = () => {
  const fetchFeedRequest = async (
    sortBy: string,
    location: LocationType
  ): Promise<Post[]> => {
    const url = `${BASE_API_URL}/review?lat=${location.lat}&long=${location.long}&sort=${sortBy}`;
    const response = await fetch(url, {
      mode: "cors",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });
    if (!response.ok) {
      throw new Error("Error while fetching posts");
    }
    return response.json();
  };
};

const useFetchPostById = (postId: string) => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const fetchPostByIdRequest = async (): Promise<PostWithComments | null> => {
    const response = await fetch(`${BASE_API_URL}/review/${postId}`, {
      method: "get",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });
    if (!response.ok) {
      throw new Error("Error while fetching post");
    }
    return response.json();
  };

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: fetchPostByIdRequest,
    enabled: enabled,
  });

  return { post, isLoading, enabled, setEnabled };
};

const useCreateComment = () => {
  const createCommentRequest = async (commentForm: CommentForm) => {
    const response = await fetch(
      `${BASE_API_URL}/review/${commentForm.postId}/comments`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          commentBody: commentForm.commentBody,
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Error creating a comment");
    }
  };

  const {
    mutateAsync: createComment,
    error,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: createCommentRequest,
  });

  return {
    createComment,
    isPending,
    isSuccess,
  };
};

export { useFetchMyFeed, useFetchPostById, useCreateComment };
