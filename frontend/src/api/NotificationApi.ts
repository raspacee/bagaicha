import { AUTH_TOKEN_NAME } from "@/lib/config";
import { Notification } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });

const BASE_API_URL = import.meta.env.VITE_API_URL;

const useFetchNotification = () => {
  const fetchNotificationRequest = async (): Promise<Notification[] | null> => {
    const response = await fetch(`${BASE_API_URL}/notification`, {
      method: "get",
      mode: "cors",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });
    if (!response.ok) {
      throw new Error("Error while fetching notification");
    }
    return response.json();
  };

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotificationRequest,
    refetchInterval: 1000,
  });

  return { notifications, isLoading };
};

const useClearNotification = () => {
  const clearNotificationRequest = async () => {
    const response = await fetch(`${BASE_API_URL}/notification/read`, {
      method: "get",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });
    if (!response.ok) {
      throw new Error("Error clearing notification");
    }
  };

  const {
    mutateAsync: clearNotification,
    isSuccess,
    error,
  } = useMutation({
    mutationFn: clearNotificationRequest,
  });

  return {
    clearNotification,
    isSuccess,
  };
};

export { useFetchNotification, useClearNotification };
