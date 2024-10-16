import { AUTH_TOKEN_NAME } from "@/lib/config";
import {
  FetchedPlaceReviewWithAuthor,
  GetReviewsResponse,
  ReviewFilterBy,
  ReviewSortBy,
} from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });

const BASE_API_URL = import.meta.env.VITE_API_URL;

const useGetAllReviews = (
  placeId: string,
  sortBy: ReviewSortBy | undefined,
  filterByStar: ReviewFilterBy | undefined,
  currentPage: number
) => {
  const getRequest = async (): Promise<GetReviewsResponse> => {
    const response = await fetch(
      `${BASE_API_URL}/place/${placeId}/review?sortBy=${
        sortBy || "newest"
      }&filterByStar=${filterByStar || "all"}&page=${currentPage}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const parsed = await response.json();
      throw new Error(parsed.message);
    }
    return response.json();
  };

  const {
    isPending,
    data: reviewsResponse,
    error,
  } = useQuery({
    queryKey: ["placeReview", placeId, sortBy, filterByStar, currentPage],
    queryFn: getRequest,
  });

  if (error) {
    toast.error(error.message);
  }

  return { isPending, reviewsResponse };
};

const useCreatePlaceReview = (placeId: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createRequest = async (form: FormData) => {
    const response = await fetch(`${BASE_API_URL}/place/${placeId}/review`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
      },
      body: form,
    });
    if (!response.ok) {
      throw new Error("Error while adding review");
    }
  };

  const {
    isPending,
    mutateAsync: createPlaceReview,
    error,
  } = useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      toast.success("Review added");
      queryClient.invalidateQueries({
        queryKey: ["placeReview", placeId],
      });
      navigate(`/place/${placeId}`);
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return { createPlaceReview, isPending };
};

export { useGetAllReviews, useCreatePlaceReview };
