import { AUTH_TOKEN_NAME } from "@/lib/config";
import { Place } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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

export { useGetPlaceSuggestions };
