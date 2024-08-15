import { AUTH_TOKEN_NAME } from "@/lib/config";
import { SearchResultsResponse, SearchState } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });

const BASE_API_URL = import.meta.env.VITE_API_URL;

const useGetSearchResults = (searchState: SearchState) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") as string;

  const getSearchResultsRequest =
    async (): Promise<SearchResultsResponse | null> => {
      const response = await fetch(
        `${BASE_API_URL}/search?q=${query}&placePage=${searchState.placePage}&postPage=${searchState.postPage}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
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
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["search", searchState, query],
    queryFn: getSearchResultsRequest,
  });

  if (error) {
    toast.error(error.message);
  }

  return { searchResults, isLoading };
};

export { useGetSearchResults };
