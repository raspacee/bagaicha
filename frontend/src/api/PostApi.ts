import { AUTH_TOKEN_NAME } from "@/lib/config";
import type {
  CommentForm,
  EditPostForm,
  FeedPost,
  FetchFeedResponse,
  LocationType,
  Post,
  PostWithComments,
  SearchResultsResponse,
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
import _ from "lodash";

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
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME) || ""}`,
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
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME) || ""}`,
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
    if (!cookies.get(AUTH_TOKEN_NAME)) {
      toast.error("Please login to comment on this post");
      return;
    }
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
    if (!cookies.get(AUTH_TOKEN_NAME)) {
      toast.error("Please login to perform this action");
      return;
    }
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
      if (!cookies.get(AUTH_TOKEN_NAME)) return;

      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousBookmarkPosts = queryClient.getQueryData<FeedPost[]>([
        "posts",
        "bookmarks",
      ]);
      const previousInfiniteData = queryClient.getQueryData<
        InfiniteData<FetchFeedResponse>
      >(["posts", "feed"]);
      const previousSearchData =
        queryClient.getQueryData<SearchResultsResponse>(["posts", "search"]);

      const queries = queryClient.getQueriesData({ queryKey: ["posts"] });

      queries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (_.isEmpty(_.difference(["posts", "feed"], queryKey))) {
            let tmp = JSON.parse(
              JSON.stringify(oldData)
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
          } else if (_.isEmpty(_.difference(["posts", "search"], queryKey))) {
            const copy = oldData as SearchResultsResponse;
            return {
              ...copy,
              post: {
                ...copy.post,
                posts: copy.post.posts.map((post) =>
                  post.id == postId
                    ? { ...post, hasLiked: true, likeCount: post.likeCount + 1 }
                    : post
                ),
              },
            };
          } else if (
            _.isEmpty(_.difference(["posts", "bookmarks"], queryKey))
          ) {
            const copy = oldData as FeedPost[];

            return copy.map((post) =>
              post.id == postId
                ? { ...post, hasLiked: true, likeCount: post.likeCount + 1 }
                : post
            );
          }
        });
      });

      return {
        previousBookmarkPosts,
        previousInfiniteData,
        previousSearchData,
      };
    },
    onError: (err, postId, context) => {
      if (context?.previousBookmarkPosts) {
        queryClient.setQueryData(
          ["posts", "bookmarks"],
          context.previousInfiniteData
        );
      }
      if (context?.previousSearchData) {
        queryClient.setQueryData(
          ["posts", "search"],
          context.previousSearchData
        );
      }
      if (context?.previousInfiniteData) {
        queryClient.setQueryData(
          ["posts", "feed"],
          context.previousInfiniteData
        );
      }
    },
  });

  return { likePost };
};

const useUnlikePost = (calledFromFeed: boolean = false) => {
  const queryClient = useQueryClient();

  const unlikePostRequest = async (postId: string) => {
    if (!cookies.get(AUTH_TOKEN_NAME)) {
      toast.error("Please login to perform this action");
      return;
    }
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
      if (!cookies.get(AUTH_TOKEN_NAME)) {
        toast.error("Please login to perform this action");
        return;
      }

      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousBookmarkPosts = queryClient.getQueryData<FeedPost[]>([
        "posts",
        "bookmarks",
      ]);
      const previousInfiniteData = queryClient.getQueryData<
        InfiniteData<FetchFeedResponse>
      >(["posts", "feed"]);
      const previousSearchData =
        queryClient.getQueryData<SearchResultsResponse>(["posts", "search"]);

      const queries = queryClient.getQueriesData({ queryKey: ["posts"] });

      queries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (_.isEmpty(_.difference(["posts", "feed"], queryKey))) {
            let tmp = JSON.parse(
              JSON.stringify(oldData)
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
          } else if (_.isEmpty(_.difference(["posts", "search"], queryKey))) {
            const copy = oldData as SearchResultsResponse;
            return {
              ...copy,
              post: {
                ...copy.post,
                posts: copy.post.posts.map((post) =>
                  post.id == postId
                    ? {
                        ...post,
                        hasLiked: false,
                        likeCount: post.likeCount - 1,
                      }
                    : post
                ),
              },
            };
          } else if (
            _.isEmpty(_.difference(["posts", "bookmarks"], queryKey))
          ) {
            const copy = oldData as FeedPost[];

            return copy.map((post) =>
              post.id == postId
                ? { ...post, hasLiked: false, likeCount: post.likeCount - 1 }
                : post
            );
          }
        });
      });

      return {
        previousBookmarkPosts,
        previousInfiniteData,
        previousSearchData,
      };
    },
    onError: (err, postId, context) => {
      if (context?.previousBookmarkPosts) {
        queryClient.setQueryData(
          ["posts", "bookmarks"],
          context.previousInfiniteData
        );
      }
      if (context?.previousSearchData) {
        queryClient.setQueryData(
          ["posts", "search"],
          context.previousSearchData
        );
      }
      if (context?.previousInfiniteData) {
        queryClient.setQueryData(
          ["posts", "feed"],
          context.previousInfiniteData
        );
      }
    },
  });

  return { unlikePost };
};

const useBookmarkPost = (calledFromFeed: boolean = false) => {
  const queryClient = useQueryClient();

  const bookmarkPostRequest = async (postId: string) => {
    if (!cookies.get(AUTH_TOKEN_NAME)) {
      toast.error("Please login to perform this action");
      return;
    }

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
      if (!cookies.get(AUTH_TOKEN_NAME)) {
        toast.error("Please login to perform this action");
        return;
      }
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousBookmarkPosts = queryClient.getQueryData<FeedPost[]>([
        "posts",
        "bookmarks",
      ]);
      const previousInfiniteData = queryClient.getQueryData<
        InfiniteData<FetchFeedResponse>
      >(["posts", "feed"]);
      const previousSearchData =
        queryClient.getQueryData<SearchResultsResponse>(["posts", "search"]);

      const queries = queryClient.getQueriesData({ queryKey: ["posts"] });

      queries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (_.isEmpty(_.difference(["posts", "feed"], queryKey))) {
            let tmp = JSON.parse(
              JSON.stringify(oldData)
            ) as InfiniteData<FetchFeedResponse>;

            for (let i = 0; i < tmp.pages.length; i++) {
              const page = tmp.pages[i];
              tmp.pages[i].posts = page.posts.map((post) =>
                post.id === postId ? { ...post, hasBookmarked: true } : post
              );
            }

            return tmp;
          } else if (_.isEmpty(_.difference(["posts", "search"], queryKey))) {
            const copy = oldData as SearchResultsResponse;
            return {
              ...copy,
              post: {
                ...copy.post,
                posts: copy.post.posts.map((post) =>
                  post.id == postId
                    ? {
                        ...post,
                        hasBookmarked: true,
                      }
                    : post
                ),
              },
            };
          } else if (
            _.isEmpty(_.difference(["posts", "bookmarks"], queryKey))
          ) {
            const copy = oldData as FeedPost[];

            return copy.map((post) =>
              post.id == postId ? { ...post, hasBookmarked: true } : post
            );
          }
        });
      });

      return {
        previousBookmarkPosts,
        previousInfiniteData,
        previousSearchData,
      };
    },
    onError: (err, postId, context) => {
      if (context?.previousBookmarkPosts) {
        queryClient.setQueryData(
          ["posts", "bookmarks"],
          context.previousInfiniteData
        );
      }
      if (context?.previousSearchData) {
        queryClient.setQueryData(
          ["posts", "search"],
          context.previousSearchData
        );
      }
      if (context?.previousInfiniteData) {
        queryClient.setQueryData(
          ["posts", "feed"],
          context.previousInfiniteData
        );
      }
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

      const previousBookmarkPosts = queryClient.getQueryData<FeedPost[]>([
        "posts",
        "bookmarks",
      ]);
      const previousInfiniteData = queryClient.getQueryData<
        InfiniteData<FetchFeedResponse>
      >(["posts", "feed"]);
      const previousSearchData =
        queryClient.getQueryData<SearchResultsResponse>(["posts", "search"]);

      const queries = queryClient.getQueriesData({ queryKey: ["posts"] });

      queries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (_.isEmpty(_.difference(["posts", "feed"], queryKey))) {
            let tmp = JSON.parse(
              JSON.stringify(oldData)
            ) as InfiniteData<FetchFeedResponse>;

            for (let i = 0; i < tmp.pages.length; i++) {
              const page = tmp.pages[i];
              tmp.pages[i].posts = page.posts.map((post) =>
                post.id === postId ? { ...post, hasBookmarked: true } : post
              );
            }

            return tmp;
          } else if (_.isEmpty(_.difference(["posts", "search"], queryKey))) {
            const copy = oldData as SearchResultsResponse;
            return {
              ...copy,
              post: {
                ...copy.post,
                posts: copy.post.posts.map((post) =>
                  post.id == postId
                    ? {
                        ...post,
                        hasBookmarked: false,
                      }
                    : post
                ),
              },
            };
          } else if (
            _.isEmpty(_.difference(["posts", "bookmarks"], queryKey))
          ) {
            const copy = oldData as FeedPost[];

            return copy.map((post) =>
              post.id == postId ? { ...post, hasBookmarked: false } : post
            );
          }
        });
      });
      return {
        previousBookmarkPosts,
        previousInfiniteData,
        previousSearchData,
      };
    },
    onError: (err, postId, context) => {
      if (context?.previousBookmarkPosts) {
        queryClient.setQueryData(
          ["posts", "bookmarks"],
          context.previousBookmarkPosts
        );
      }
      if (context?.previousSearchData) {
        queryClient.setQueryData(
          ["posts", "search"],
          context.previousSearchData
        );
      }
      if (context?.previousInfiniteData) {
        queryClient.setQueryData(
          ["posts", "feed"],
          context.previousInfiniteData
        );
      }
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
