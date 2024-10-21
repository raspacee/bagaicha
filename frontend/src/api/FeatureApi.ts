import { AUTH_TOKEN_NAME } from "@/lib/config";
import { FetchedFeature } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "universal-cookie";
import { toast } from "sonner";

const cookies = new Cookies(null, { path: "/" });
const BASE_API_URL = import.meta.env.VITE_API_URL;

export const useFetchPlaceFeatures = (placeId: string) => {
  const fetchRequest = async (): Promise<FetchedFeature[] | null> => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}/feature`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Error while fetching place features");
    }
    return response.json();
  };

  const {
    data: placeFeatures,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["feature", "place", placeId],
    queryFn: fetchRequest,
  });

  if (error) {
    toast.error(error.message);
  }

  return { placeFeatures, isLoading };
};

export const useFetchAllDatabaseFeatures = () => {
  const fetchRequest = async (): Promise<FetchedFeature[] | null> => {
    const response = await fetch(`${BASE_API_URL}/place/feature/all`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Error while fetching place features");
    }
    return response.json();
  };

  const {
    data: features,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["feature", "all"],
    queryFn: fetchRequest,
  });

  if (error) {
    toast.error(error.message);
  }

  return { features, isLoading };
};

export const useAddFeatureToPlace = (placeId: string) => {
  const queryClient = useQueryClient();

  const addRequest = async (featureId: number) => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}/feature`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ featureId }),
    });
    if (!response.ok) {
      throw new Error("Error while adding feature");
    }
  };

  const {
    mutateAsync: addFeature,
    isPending,
    error,
  } = useMutation({
    mutationFn: addRequest,
    onSuccess: (data, featureId) => {
      toast.success("Added Feature");
      queryClient.invalidateQueries({
        queryKey: ["feature", "place", placeId],
      });
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { addFeature, isPending };
};

export const useRemoveFeatureFromPlace = (placeId: string) => {
  const queryClient = useQueryClient();

  const removeRequest = async (featureId: number) => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}/feature`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ featureId }),
    });
    if (!response.ok) {
      throw new Error("Error while removing feature");
    }
  };

  const {
    mutateAsync: removeFeature,
    isPending,
    error,
  } = useMutation({
    mutationFn: removeRequest,
    onSuccess: () => {
      toast.info("Removed Feature");
      queryClient.invalidateQueries({
        queryKey: ["feature", "place", placeId],
      });
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { removeFeature, isPending };
};
