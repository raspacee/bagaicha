import { AUTH_TOKEN_NAME } from "@/lib/config";
import type {
  CommentForm,
  FeedPost,
  LocationType,
  Post,
  PostWithComments,
} from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });

const BASE_API_URL = import.meta.env.VITE_API_URL;

const useFetchMyFeed = (sortBy: string, location: LocationType) => {
  const fetchFeedRequest = async (
    sortBy: string,
    location: LocationType
  ): Promise<FeedPost[]> => {
    const url = `${BASE_API_URL}/post?lat=${location.lat}&long=${location.long}&sort=${sortBy}`;
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

  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts", sortBy],
    queryFn: () => fetchFeedRequest(sortBy, location),
  });

  if (error) {
    toast.error(error.message);
  }

  return { posts, isLoading };
};

const useFetchPostById = (postId: string) => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const fetchPostByIdRequest = async (): Promise<PostWithComments | null> => {
    const response = await fetch(`${BASE_API_URL}/post/${postId}`, {
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
    queryKey: ["posts", postId],
    queryFn: fetchPostByIdRequest,
    enabled: enabled,
  });

  if (error) {
    toast.error(error.message);
  }

  return { post, isLoading, enabled, setEnabled };
};

const useCreateComment = () => {
  const createCommentRequest = async (commentForm: CommentForm) => {
    const response = await fetch(`${BASE_API_URL}/post/comments`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(commentForm),
    });
    if (!response.ok) {
      throw new Error("Error while creating comment");
    }
  };

  const {
    mutateAsync: createComment,
    error,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: createCommentRequest,
    retry: 2,
  });

  if (error) {
    toast.error(error.message);
  }

  return {
    createComment,
    isPending,
    isSuccess,
  };
};

const useCreatePost = () => {
  const createPostRequest = async (formData: FormData): Promise<Post> => {
    const response = await fetch(`${BASE_API_URL}/post`, {
      method: "POST",
      body: formData,
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });
    if (!response.ok) {
      throw new Error("Error while creating a post");
    }
    return response.json();
  };

  const {
    mutateAsync: createPost,
    isPending,
    isSuccess,
    error,
  } = useMutation({ mutationFn: createPostRequest });

  if (error) {
    toast.error(error.message);
  }

  if (isSuccess) {
    toast.success("Created a post successfully");
  }

  return { createPost, isPending, isSuccess };
};

const useLikePost = () => {
  const queryClient = useQueryClient();

  const likePostRequest = async (postId: string) => {
    const response = await fetch(`${BASE_API_URL}/post/${postId}/likes`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });
    if (!response.ok) {
      throw new Error("Error while liking a post");
    }
  };

  const { mutateAsync: likePost } = useMutation({
    mutationFn: likePostRequest,
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts = queryClient.getQueriesData({
        queryKey: ["posts"],
      })[1];

      queryClient.setQueriesData(
        { queryKey: ["posts"] },
        (oldPosts: FeedPost[] | undefined) =>
          oldPosts?.map((post) =>
            post.id == postId ? { ...post, hasLiked: true } : post
          )
      );
      return { previousPosts };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(["posts"], context?.previousPosts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { likePost };
};

const useUnlikePost = () => {
  const queryClient = useQueryClient();

  const unlikePostRequest = async (postId: string) => {
    const response = await fetch(`${BASE_API_URL}/post/${postId}/likes`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });
    if (!response.ok) {
      throw new Error("Error while unliking a post");
    }
  };

  const { mutateAsync: unlikePost } = useMutation({
    mutationFn: unlikePostRequest,
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts = queryClient.getQueriesData({
        queryKey: ["posts"],
      })[1];

      queryClient.setQueriesData(
        { queryKey: ["posts"] },
        (oldPosts: FeedPost[] | undefined) =>
          oldPosts?.map((post) =>
            post.id == postId ? { ...post, hasLiked: false } : post
          )
      );
      return { previousPosts };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(["posts"], context?.previousPosts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { unlikePost };
};

const useBookmarkPost = () => {
  const queryClient = useQueryClient();

  const bookmarkPostRequest = async (postId: string) => {
    const response = await fetch(`${BASE_API_URL}/post/${postId}/bookmarks`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
  };

  const { mutateAsync: bookmarkPost } = useMutation({
    mutationFn: bookmarkPostRequest,
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts = queryClient.getQueriesData({
        queryKey: ["posts"],
      })[1];

      queryClient.setQueriesData(
        { queryKey: ["posts"] },
        (oldPosts: FeedPost[] | undefined) =>
          oldPosts?.map((post) =>
            post.id == postId ? { ...post, hasBookmarked: true } : post
          )
      );
      return { previousPosts };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(["posts"], context?.previousPosts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { bookmarkPost };
};

const useUnbookmarkPost = () => {
  const queryClient = useQueryClient();

  const unbookmarkPostRequest = async (postId: string) => {
    const response = await fetch(`${BASE_API_URL}/post/${postId}/bookmarks`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
  };

  const { mutateAsync: unbookmarkPost } = useMutation({
    mutationFn: unbookmarkPostRequest,
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts = queryClient.getQueriesData({
        queryKey: ["posts"],
      })[1];

      queryClient.setQueriesData(
        { queryKey: ["posts"] },
        (oldPosts: FeedPost[] | undefined) =>
          oldPosts?.map((post) =>
            post.id == postId ? { ...post, hasBookmarked: true } : post
          )
      );
      return { previousPosts };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(["posts"], context?.previousPosts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { unbookmarkPost };
};

export {
  useFetchMyFeed,
  useFetchPostById,
  useCreateComment,
  useCreatePost,
  useLikePost,
  useUnlikePost,
  useBookmarkPost,
  useUnbookmarkPost,
};
