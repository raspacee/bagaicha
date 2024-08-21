import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "universal-cookie";
import { AUTH_TOKEN_NAME } from "../lib/config";
import { FeedPost, User } from "@/lib/types";
import { toast } from "sonner";
import { useState } from "react";

const cookies = new Cookies(null, { path: "/" });

const BASE_API_URL = import.meta.env.VITE_API_URL;

export const useGetMyUserData = () => {
  const fetchMyUserDataRequest = async (): Promise<User | null> => {
    const response = await fetch(`${BASE_API_URL}/user/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get my user data");
    }

    return response.json();
  };

  const {
    data: myUser,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["myUser"],
    queryFn: fetchMyUserDataRequest,
  });

  if (error) {
    toast.error("Error while fetching your data");
  }

  return { myUser, isLoading, isError };
};

export const useGetUserData = (userId: string) => {
  const fetchUserDataRequest = async (): Promise<User | null> => {
    const response = await fetch(`${BASE_API_URL}/user/${userId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to get user data");
    }

    return response.json();
  };

  const {
    data: user,
    isLoading,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: fetchUserDataRequest,
  });

  if (error) {
    toast.error("Error while fetching user data");
  }

  return { user, isLoading, isSuccess };
};

export const useGetUserPosts = (userId: string) => {
  const [enabled, setEnabled] = useState(false);

  const getUserPostsRequest = async (): Promise<FeedPost[]> => {
    const response = await fetch(`${BASE_API_URL}/user/${userId}/posts`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user posts");
    }

    return response.json();
  };

  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts", "bookmarks", userId],
    queryFn: getUserPostsRequest,
    enabled: enabled,
  });

  if (error) {
    toast.error(error.message);
  }

  return { posts, isLoading, setEnabled };
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  const updateUserRequest = async (formData: FormData) => {
    const response = await fetch(`${BASE_API_URL}/user/settings`, {
      method: "put",
      body: formData,
      headers: {
        Authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
  };

  const {
    mutateAsync: updateUser,
    isPending,
    isSuccess,
    error,
  } = useMutation({
    mutationFn: updateUserRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myUser"] });
    },
  });

  if (isSuccess) {
    toast.success("User updated successfully");
  }

  if (error) {
    toast.error(error.message);
  }

  return { updateUser, isPending };
};
