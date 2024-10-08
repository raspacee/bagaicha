import { AUTH_TOKEN_NAME } from "@/lib/config";
import type {
  CommentForm,
  EditPostForm,
  FeedPost,
  FetchFeedResponse,
  LocationType,
  Post,
  PostWithComments,
} from "@/lib/types";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });

const BASE_API_URL = import.meta.env.VITE_API_URL;

const useFetchMyFeed = (sortBy: string, location: LocationType) => {
  const fetchFeedRequest = async ({
    pageParam,
  }: {
    pageParam: number;
  }): Promise<FetchFeedResponse> => {
    const url = `${BASE_API_URL}/post?lat=${location.lat}&long=${location.long}&sort=${sortBy}&page=${pageParam}`;
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
    data,
    isFetching,
    isFetchingNextPage,
    error,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", "feed", sortBy],
    queryFn: fetchFeedRequest,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  if (error) {
    toast.error(error.message);
  }

  return { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage };
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

const useLikePost = (calledFromFeed: boolean = false) => {
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

      let previousData:
        | InfiniteData<FetchFeedResponse, unknown>
        | undefined
        | FeedPost[];

      if (!calledFromFeed) {
        const result = queryClient.getQueriesData<FeedPost[]>({
          queryKey: ["posts", "bookmarks"],
        })[1];
        previousData = result && result.length > 0 ? result[1] : [];

        queryClient.setQueriesData(
          { queryKey: ["posts", "bookmarks"] },
          (oldPosts: FeedPost[] | undefined) =>
            oldPosts?.map((post) =>
              post.id == postId
                ? { ...post, hasLiked: true, likeCount: post.likeCount + 1 }
                : post
            )
        );
      } else {
        previousData = queryClient.getQueriesData<
          InfiniteData<FetchFeedResponse>
        >({
          queryKey: ["posts", "feed"],
        })[0][1];

        queryClient.setQueriesData<InfiniteData<FetchFeedResponse>>(
          { queryKey: ["posts", "feed"] },
          (data) => {
            if (!data) return data;

            /* Create a deep copy of the data */
            let tmp = JSON.parse(
              JSON.stringify(data)
            ) as InfiniteData<FetchFeedResponse>;
            for (let i = 0; i < tmp.pages.length; i++) {
              const page = tmp.pages[i];
              tmp.pages[i].posts = page.posts.map((post) =>
                post.id === postId
                  ? { ...post, hasLiked: true, likeCount: post.likeCount + 1 }
                  : post
              );
            }

            return tmp;
          }
        );
      }

      return { previousData };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(["posts"], context?.previousData);
    },
  });

  return { likePost };
};

const useUnlikePost = (calledFromFeed: boolean = false) => {
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

      let previousData:
        | InfiniteData<FetchFeedResponse, unknown>
        | undefined
        | FeedPost[];

      if (!calledFromFeed) {
        const result = queryClient.getQueriesData<FeedPost[]>({
          queryKey: ["posts", "bookmarks"],
        })[1];
        previousData = result && result.length > 0 ? result[1] : [];

        queryClient.setQueriesData(
          { queryKey: ["posts", "bookmarks"] },
          (oldPosts: FeedPost[] | undefined) =>
            oldPosts?.map((post) =>
              post.id == postId
                ? { ...post, hasLiked: false, likeCount: post.likeCount - 1 }
                : post
            )
        );
      } else {
        previousData = queryClient.getQueriesData<
          InfiniteData<FetchFeedResponse>
        >({
          queryKey: ["posts", "feed"],
        })[0][1];

        queryClient.setQueriesData<InfiniteData<FetchFeedResponse>>(
          { queryKey: ["posts", "feed"] },
          (data) => {
            if (!data) return data;

            /* Create a deep copy of the data */
            let tmp = JSON.parse(
              JSON.stringify(data)
            ) as InfiniteData<FetchFeedResponse>;
            for (let i = 0; i < tmp.pages.length; i++) {
              const page = tmp.pages[i];
              tmp.pages[i].posts = page.posts.map((post) =>
                post.id === postId
                  ? { ...post, hasLiked: false, likeCount: post.likeCount - 1 }
                  : post
              );
            }

            return tmp;
          }
        );
      }

      return { previousData };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(["posts"], context?.previousData);
    },
  });

  return { unlikePost };
};

const useBookmarkPost = (calledFromFeed: boolean = false) => {
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

      let previousData:
        | InfiniteData<FetchFeedResponse, unknown>
        | undefined
        | FeedPost[];

      if (!calledFromFeed) {
        const result = queryClient.getQueriesData<FeedPost[]>({
          queryKey: ["posts", "bookmarks"],
        })[1];
        previousData = result && result.length > 0 ? result[1] : [];

        queryClient.setQueriesData(
          { queryKey: ["posts", "bookmarks"] },
          (oldPosts: FeedPost[] | undefined) =>
            oldPosts?.map((post) =>
              post.id == postId ? { ...post, hasBookmarked: true } : post
            )
        );
      } else {
        previousData = queryClient.getQueriesData<
          InfiniteData<FetchFeedResponse>
        >({
          queryKey: ["posts", "feed"],
        })[0][1];

        queryClient.setQueriesData<InfiniteData<FetchFeedResponse>>(
          { queryKey: ["posts", "feed"] },
          (data) => {
            if (!data) return data;

            /* Create a deep copy of the data */
            let tmp = JSON.parse(
              JSON.stringify(data)
            ) as InfiniteData<FetchFeedResponse>;
            for (let i = 0; i < tmp.pages.length; i++) {
              const page = tmp.pages[i];
              tmp.pages[i].posts = page.posts.map((post) =>
                post.id === postId ? { ...post, hasBookmarked: true } : post
              );
            }

            return tmp;
          }
        );
      }

      return { previousData };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(["posts"], context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { bookmarkPost };
};

const useUnbookmarkPost = (calledFromFeed: boolean = false) => {
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

      let previousData:
        | InfiniteData<FetchFeedResponse, unknown>
        | undefined
        | FeedPost[];

      if (!calledFromFeed) {
        const result = queryClient.getQueriesData<FeedPost[]>({
          queryKey: ["posts", "bookmarks"],
        })[1];
        previousData = result && result.length > 0 ? result[1] : [];

        queryClient.setQueriesData(
          { queryKey: ["posts", "bookmarks"] },
          (oldPosts: FeedPost[] | undefined) =>
            oldPosts?.map((post) =>
              post.id == postId ? { ...post, hasBookmarked: false } : post
            )
        );
      } else {
        previousData = queryClient.getQueriesData<
          InfiniteData<FetchFeedResponse>
        >({
          queryKey: ["posts", "feed"],
        })[0][1];

        queryClient.setQueriesData<InfiniteData<FetchFeedResponse>>(
          { queryKey: ["posts", "feed"] },
          (data) => {
            if (!data) return data;

            /* Create a deep copy of the data */
            let tmp = JSON.parse(
              JSON.stringify(data)
            ) as InfiniteData<FetchFeedResponse>;
            for (let i = 0; i < tmp.pages.length; i++) {
              const page = tmp.pages[i];
              tmp.pages[i].posts = page.posts.map((post) =>
                post.id === postId ? { ...post, hasBookmarked: false } : post
              );
            }

            return tmp;
          }
        );
      }

      return { previousData };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(["posts"], context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { unbookmarkPost };
};

const useUpdateMyPost = (postId: string) => {
  const queryClient = useQueryClient();

  const updatePostRequest = async (form: EditPostForm) => {
    const response = await fetch(`${BASE_API_URL}/post/${postId}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
  };

  const {
    mutateAsync: updateMyPost,
    isPending,
    error,
  } = useMutation({
    mutationFn: updatePostRequest,
    onSuccess: () => {
      toast.success("Post updated successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { updateMyPost, isPending };
};

const useDeleteMyPost = () => {
  const queryClient = useQueryClient();

  const deletePostRequest = async (postId: string) => {
    const response = await fetch(`${BASE_API_URL}/post/${postId}`, {
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

  const {
    mutateAsync: deletePost,
    isPending,
    error,
  } = useMutation({
    mutationFn: deletePostRequest,
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { deletePost, isPending };
};

const useGetMyBookmarks = () => {
  const getBookmarksRequest = async (): Promise<FeedPost[]> => {
    const response = await fetch(`${BASE_API_URL}/post/bookmarks`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }

    return response.json();
  };

  const {
    data: bookmarks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts", "bookmarks"],
    queryFn: getBookmarksRequest,
  });

  if (error) {
    toast.error(error.message);
  }

  return { bookmarks, isLoading };
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
  useUpdateMyPost,
  useDeleteMyPost,
  useGetMyBookmarks,
};
