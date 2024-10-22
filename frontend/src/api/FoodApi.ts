import { AUTH_TOKEN_NAME } from "@/lib/config";
import { CreateFoodForm, FetchedFood } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });
const BASE_API_URL = import.meta.env.VITE_API_URL;

export const useFetchPlaceFoods = (placeId: string) => {
  const fetchRequest = async (): Promise<FetchedFood[]> => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}/food`, {
      method: "GET",
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    return response.json();
  };

  const {
    isLoading,
    data: foods,
    error,
  } = useQuery({
    queryKey: ["food", "place", placeId],
    queryFn: fetchRequest,
  });

  if (error) {
    toast.error(error.message);
  }

  return { foods, isLoading };
};

export const useCreatePlaceFood = (placeId: string) => {
  const queryClient = useQueryClient();

  const createRequest = async (form: CreateFoodForm) => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}/food`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    return response.json();
  };

  const {
    mutateAsync: createFood,
    isPending,
    error,
  } = useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food", "place", placeId] });
      toast.success("Food Added");
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { createFood, isPending };
};

export const useDeletePlaceFood = (placeId: string) => {
  const queryClient = useQueryClient();

  const deleteRequest = async (foodId: number) => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}/food`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ foodId }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
  };

  const {
    mutateAsync: deleteFood,
    isPending,
    error,
  } = useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food", "place", placeId] });
      toast.info("Food Deleted");
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { deleteFood, isPending };
};

export const useUpdatePlaceFood = (placeId: string) => {
  const queryClient = useQueryClient();

  const updateRequest = async (food: FetchedFood) => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}/food`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(food),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
  };

  const {
    mutateAsync: updateFood,
    isPending,
    error,
  } = useMutation({
    mutationFn: updateRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food", "place", placeId] });
      toast.success("Food Updated");
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { updateFood, isPending };
};
