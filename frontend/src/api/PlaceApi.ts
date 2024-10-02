import { AUTH_TOKEN_NAME } from "@/lib/config";
import {
  CreatePlaceResponse,
  FindPlaceSearchState,
  LocationType,
  Place,
  PlaceImage,
} from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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

/* Fetch a single place's data */
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

const getUserPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by your browser"));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: false,
      }
    );
  });
};

const useGetTopPlaces = (
  searchState: FindPlaceSearchState,
  userPosition: LocationType
) => {
  const getTopPlacesRequest = async (): Promise<Place[]> => {
    const params = new URLSearchParams();
    params.set("selectedFoods", searchState.selectedFoods.join(","));
    params.set("selectedFeatures", searchState.selectedFeatures.join(","));
    params.set(
      "selectedDistance",
      JSON.stringify(searchState.selectedDistance)
    );
    params.set("lat", userPosition.lat.toString());
    params.set("lon", userPosition.long.toString());
    const response = await fetch(
      `${BASE_API_URL}/place/top?${params.toString()}`,
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        },
      }
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    return response.json();
  };

  const {
    data: places,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["topPlaces", searchState],
    queryFn: getTopPlacesRequest,
  });

  if (error) {
    toast.error(error.message);
  }

  return { places, isLoading };
};

const useCreatePlace = () => {
  const navigate = useNavigate();

  const createPlaceRequest = async (
    formData: FormData
  ): Promise<CreatePlaceResponse> => {
    const response = await fetch(`${BASE_API_URL}/place`, {
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
    return response.json();
  };

  const {
    mutateAsync: createPlace,
    isPending,
    error,
  } = useMutation({
    mutationFn: createPlaceRequest,
    onSuccess: (createdPlace) => {
      toast.success("Place created successfully");
      navigate(`/place/${createdPlace.id}`);
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { isPending, createPlace };
};

const useGetMyPlaces = () => {
  const getMyPlacesRequest = async (): Promise<Place[] | null> => {
    const response = await fetch(`${BASE_API_URL}/place/my`, {
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
    data: places,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myPlaces"],
    queryFn: getMyPlacesRequest,
  });

  if (error) {
    toast.error(error.message);
  }

  return { places, isLoading };
};

/* Fetch a single place's all images */
const useGetPlaceImages = (placeId: string) => {
  const getPlaceImages = async (): Promise<PlaceImage[] | null> => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}/image`, {
      method: "GET",
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    return response.json();
  };

  const {
    data: placeImages,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["places", placeId, "images"],
    queryFn: getPlaceImages,
    enabled: false,
  });

  const fetchImages = () => {
    refetch();
  };

  if (error) {
    toast.error(error.message);
  }

  return { placeImages, isLoading, fetchImages };
};

const useUploadPlaceImages = (placeId: string) => {
  const uploadPlaceImages = async (formData: FormData) => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}/image`, {
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
    return response.json();
  };

  const {
    error,
    isPending,
    mutateAsync: uploadImages,
  } = useMutation({
    mutationFn: uploadPlaceImages,
    onSuccess: () => {
      toast.success("Photos uploaded successfully");
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { isPending, uploadImages };
};

const useDeleteImage = (cloudinaryId: string, refetchCallback: () => void) => {
  const deleteImageRequest = async () => {
    const response = await fetch(`${BASE_API_URL}/place/image`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ cloudinaryId }),
    });
    if (response.status !== 204) {
      throw new Error("Error while deleting image");
    }
  };

  const {
    isPending,
    mutateAsync: deleteImage,
    error,
  } = useMutation({
    mutationFn: deleteImageRequest,
    onSuccess: async () => {
      toast.success("Photo deleted");
      refetchCallback();
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { isPending, deleteImage };
};

export {
  useGetPlaceSuggestions,
  useGetPlaceData,
  useRequestOwnership,
  useUpdatePlaceData,
  useGetTopPlaces,
  useCreatePlace,
  useGetMyPlaces,
  useGetPlaceImages,
  useUploadPlaceImages,
  useDeleteImage,
};
