import { useQuery } from "@tanstack/react-query";
import Cookies from "universal-cookie";
import { AUTH_TOKEN_NAME } from "../lib/config";

type User = {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
  moderation_lvl: string;
  email: string;
};

const cookies = new Cookies(null, { path: "/" });

const BASE_API_URL = import.meta.env.VITE_API_URL;

export const useGetMyUserData = () => {
  const fetchUserDataRequest = async (): Promise<User | null> => {
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
  } = useQuery({
    queryKey: ["myUser"],
    queryFn: fetchUserDataRequest,
  });

  return { myUser, isLoading };
};
