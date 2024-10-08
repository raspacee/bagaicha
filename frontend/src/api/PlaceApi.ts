import { AUTH_TOKEN_NAME } from "@/lib/config";
import {
  AddOperatingHourForm,
  CreatePlaceResponse,
  FetchedOperatingHourForm,
  FindPlaceSearchState,
  LocationType,
  OperatingHourForm,
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

const useGetOperatingHours = (placeId: string) => {
  const getRequest = async (): Promise<FetchedOperatingHourForm[] | null> => {
    const response = await fetch(
      `${BASE_API_URL}/place/${placeId}/operatinghour`,
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Error getting operating hours");
    }
    return response.json();
  };

  const {
    isLoading,
    data: operatingHours,
    error,
  } = useQuery({
    queryKey: ["places", placeId, "operatingHours"],
    queryFn: getRequest,
  });

  if (error) {
    toast.error(error.message);
  }

  return { operatingHours, isLoading };
};

const useCreateOperatingHour = (
  placeId: string,
  closeFormCallback: () => void
) => {
  const queryClient = useQueryClient();

  const createRequest = async (form: OperatingHourForm) => {
    const response = await fetch(
      `${BASE_API_URL}/place/${placeId}/operatinghour`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );
    if (!response.ok) {
      throw new Error("Error while adding operating hour");
    }
  };

  const {
    mutateAsync: createOperatingHour,
    error,
    isPending,
  } = useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      closeFormCallback();
      toast.success("Operating hour added");
      queryClient.invalidateQueries({
        queryKey: ["places", placeId],
      });
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { createOperatingHour, isPending };
};

const useDeleteOperatingHour = (placeId: string) => {
  const queryClient = useQueryClient();

  const deleteRequest = async (operatingHourId: string) => {
    const response = await fetch(
      `${BASE_API_URL}/place/${placeId}/operatinghour`,
      {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          operatingHourId,
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Error while deleting operating hour");
    }
  };

  const {
    mutateAsync: deleteOperatingHour,
    error,
    isPending,
  } = useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => {
      toast.success("Operating hour deleted");
      queryClient.invalidateQueries({
        queryKey: ["places", placeId],
      });
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { deleteOperatingHour, isPending };
};

const useGetPlaceMenus = (placeId: string) => {
  const getMenusRequest = async (): Promise<PlaceImage[] | null> => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}/menu`, {
      method: "GET",
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    return response.json();
  };

  const {
    data: menuImages,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["places", placeId, "menus"],
    queryFn: getMenusRequest,
  });

  if (error) {
    toast.error(error.message);
  }

  return { menuImages, isLoading };
};

const useUploadPlaceMenuImages = (
  placeId: string,
  cleanupCallbackFn: () => void
) => {
  const queryClient = useQueryClient();

  const uploadRequest = async (formData: FormData) => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}/menu`, {
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
    isPending,
    error,
    mutateAsync: uploadMenuImages,
  } = useMutation({
    mutationFn: uploadRequest,
    onSuccess: () => {
      toast.success("Menu uploaded");
      queryClient.invalidateQueries({
        queryKey: ["places", placeId, "menus"],
      });
      cleanupCallbackFn();
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { isPending, uploadMenuImages };
};

const useDeletePlaceMenuImage = (placeId: string) => {
  const queryClient = useQueryClient();

  const deleteRequest = async (imageCloudinaryId: string) => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}/menu`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ cloudinaryId: imageCloudinaryId }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
  };

  const {
    isPending,
    error,
    mutateAsync: deleteMenuImage,
  } = useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => {
      toast.success("Photo deleted");
      queryClient.invalidateQueries({
        queryKey: ["places", placeId, "menus"],
      });
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { isPending, deleteMenuImage };
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
  useGetOperatingHours,
  useCreateOperatingHour,
  useDeleteOperatingHour,
  useGetPlaceMenus,
  useUploadPlaceMenuImages,
  useDeletePlaceMenuImage,
};
