import { AUTH_TOKEN_NAME } from "@/lib/config";
import { Place } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });

const BASE_API_URL = import.meta.env.VITE_API_URL;

const useGetPlaceSuggestions = () => {
  const [query, setQuery] = useState("");
  const [enabled, setEnabled] = useState(false);

  const getPlaceSuggestionRequest = async (): Promise<Place[]> => {
    const response = await fetch(`${BASE_API_URL}/place/suggestion/${query}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });
    console.log(response);
    if (!response.ok) {
      throw new Error("Error getting place suggestion");
    }
    return response.json();
  };

  const { data: suggestions } = useQuery({
    queryKey: ["suggestions", query],
    queryFn: getPlaceSuggestionRequest,
    enabled: enabled,
  });

  return { suggestions, setQuery, setEnabled };
};

const useGetPlaceData = (placeId: string) => {
  const getPlaceRequest = async (): Promise<Place | null> => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
    });
    if (!response.ok) {
      throw new Error("Error while fetching place data");
    }
    return response.json();
  };

  const {
    data: place,
    isLoading,
    error,
  } = useQuery({
    queryFn: getPlaceRequest,
    queryKey: ["places", placeId],
  });

  if (error) {
    toast.error(error.message);
  }

  return { place, isLoading };
};

const useRequestOwnership = (placeId: string) => {
  const navigate = useNavigate();

  const requestOwnershipRequest = async (formData: FormData) => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}/ownership`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
  };

  const {
    mutateAsync: requestOwnership,
    isPending,
    error,
  } = useMutation({
    mutationFn: requestOwnershipRequest,
    onSuccess: () => {
      toast.success("Ownership Request Successful");
      navigate(`/place/${placeId}`);
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { requestOwnership, isPending };
};

const useUpdatePlaceData = () => {
  const updatePlaceRequest = async (formData: FormData) => {
    const response = await fetch(
      `${BASE_API_URL}/place/${(formData as any).placeId}/`,
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        },
        body: formData,
      }
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
  };

  const {
    mutateAsync: updatePlace,
    isPending,
    error,
  } = useMutation({
    mutationFn: updatePlaceRequest,
    onSuccess: () => {
      toast.success("Update Successful");
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return {
    updatePlace,
    isPending,
  };
};

export {
  useGetPlaceSuggestions,
  useGetPlaceData,
  useRequestOwnership,
  useUpdatePlaceData,
};
