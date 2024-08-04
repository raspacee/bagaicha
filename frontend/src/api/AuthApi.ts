import Cookies from "universal-cookie";

import { AUTH_TOKEN_NAME } from "../lib/config";
import { useQuery } from "@tanstack/react-query";

const cookies = new Cookies(null, { path: "/" });

const BASE_API_URL = import.meta.env.VITE_API_URL;

type AuthenticateUserResponse = {
  authenticated: Boolean;
};

export const useAuthenticateUser = () => {
  const authenticateUserRequest =
    async (): Promise<AuthenticateUserResponse> => {
      const response = await fetch(`${BASE_API_URL}/auth/authenticate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to authenticate user");
      }

      return response.json();
    };

  const { data, isLoading, error } = useQuery({
    queryKey: ["authenticateUser"],
    queryFn: authenticateUserRequest,
    retry: false,
  });

  /* TODO: If error throw a toast, clean user auths and redirect to login */

  return { data, isLoading };
};
