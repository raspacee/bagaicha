import { AUTH_TOKEN_NAME } from "@/lib/config";
import { OwnershipRequest } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });

const BASE_API_URL = import.meta.env.VITE_API_URL;

const useGetRequestOwnership = () => {
  const getRequestOwnershipRequest = async (): Promise<
    OwnershipRequest[] | null
  > => {
    const response = await fetch(`${BASE_API_URL}/place/ownership`, {
      method: "get",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });
    if (!response.ok) {
      throw new Error("Error while fetching ownership requests");
    }
    return response.json();
  };

  const { data: ownershipRequests, isLoading } = useQuery({
    queryKey: ["requestOwnerships"],
    queryFn: getRequestOwnershipRequest,
  });

  return { ownershipRequests, isLoading };
};

const useGrantRequestOwnership = (placeId: string) => {
  const queryClient = useQueryClient();

  const grantOwnershipRequest = async (requestId: string) => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}/ownership`, {
      method: "put",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        requestId,
      }),
    });
    if (!response.ok) {
      throw new Error("Error while granting ownership request");
    }
  };

  const {
    isPending,
    error,
    mutateAsync: grantOwnership,
  } = useMutation({
    mutationFn: grantOwnershipRequest,
    onSuccess: () => {
      toast.success("Request granted successfully");
      queryClient.invalidateQueries({
        queryKey: ["requestOwnerships"],
      });
      queryClient.invalidateQueries({
        queryKey: ["places", placeId],
      });
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return {
    isPending,
    grantOwnership,
  };
};

export { useGetRequestOwnership, useGrantRequestOwnership };
