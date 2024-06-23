import { useState, useEffect } from "react";
import { LatLngExpression } from "leaflet";
import Cookies from "universal-cookie";

import { useAppSelector } from "../hooks";
import FindPlacesMap from "../components/place/FindPlaceMap";
import FindPlacesItem from "../components/place/FindPlacesItem";
import Filter from "../components/filter/Filter";
import { FetchOptionType } from "../lib/types";
import { FetchState } from "../lib/enums";
import type { FilterType } from "../lib/types";
import { AUTH_TOKEN } from "../lib/cookie_names";

export default function FindPlaces() {
  const userLocation = useAppSelector((state) => state.location);
  const filterState: FilterType = useAppSelector((state) => state.filter);
  const [places, setPlaces] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([
    userLocation.lat,
    userLocation.long,
  ]);
  const [activePlaceId, setActivePlaceId] = useState<string>("");
  const cookies = new Cookies(null, {
    path: "/",
  });

  useEffect(() => {
    const fetchPlaces = async () => {
      let url: string;
      let filters: string[] = [];

      /* Handling the suggested checkboxes */
      Object.keys(filterState.suggested).forEach((key: string) => {
        if (filterState.suggested[key as keyof FilterType["suggested"]]) {
          filters.push(key);
        }
      });
      const suggested = filters.join(",");

      /* Handling the category checkboxes */
      filters = [];
      Object.keys(filterState.category).forEach((key: string) => {
        if (filterState.category[key as keyof FilterType["category"]]) {
          filters.push(key);
        }
      });
      const category = filters.join(",");

      if (userLocation.lat != -1 && userLocation.long != -1) {
        url = `${import.meta.env.VITE_API_URL}/place/top_places?lat=${
          userLocation.lat
        }&long=${
          userLocation.long
        }&suggested=${suggested}&category=${category}&distance=${
          filterState.distance.distancePicked
        }`;
      } else {
        url = `${import.meta.env.VITE_API_URL}/place/top_places?lat=${
          userLocation.lat
        }&long=${userLocation.long}`;
      }
      try {
        const res = await fetch(url, {
          method: "get",
          mode: "cors",
          headers: {
            authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
          },
        });
        const data = await res.json();
        console.log(data);
        setPlaces(data.places);
      } catch (err) {
        console.log(err);
      }
    };
    fetchPlaces();
  }, [filterState]);

  const handleHover = (lat: number, long: number, id: string) => {
    setMapCenter([lat, long]);
    setActivePlaceId(id);
  };

  return (
    <div className="grid grid-cols-3 gap-1">
      <div className="col-span-2 px-4">
        <div className="w-full h-fit mt-3">
          <h1 className="font-normal px-4 py-3 text-2xl bg-white rounded-md my-3">
            Top places around you
          </h1>
          <Filter />
          {places == null ? (
            <h2>No place found</h2>
          ) : (
            places.map((place: any, index: number) => (
              <div
                onMouseEnter={() =>
                  handleHover(
                    parseFloat(place.lat),
                    parseFloat(place.long),
                    place.id
                  )
                }
                key={place.id}
              >
                <FindPlacesItem place={place} index={index + 1} />
              </div>
            ))
          )}
        </div>
      </div>
      <div className="col-span-1 w-full bg-white rounded-md mt-3 h-svh sticky top-1">
        <FindPlacesMap
          places={places}
          mapCenter={mapCenter}
          activePlaceId={activePlaceId}
        />
      </div>
    </div>
  );
}
