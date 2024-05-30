import { FaQuoteLeft } from "@react-icons/all-files/fa/FaQuoteLeft";
import { IoIosStar } from "@react-icons/all-files/io/IoIosStar";
import { FaRegMehRollingEyes } from "@react-icons/all-files/fa/FaRegMehRollingEyes";

import { useEffect, useState } from "react";
import { useSearchParams, Link, useParams } from "react-router-dom";
import { DateTime } from "luxon";

import PlaceRating from "../components/place/PlaceRating";
import RatingStar from "../components/place/RatingStar";
import Map from "../components/place/Map";
import { place_features } from "./edit_place";
import { isMod } from "../lib/isMod";

export default function Place() {
  const { place_id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [place, setPlace] = useState<any>(null);
  const [aggregatedRating, setAggregatedRating] = useState<number>(0);
  const [ratings, setRatings] = useState<any>(null);
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    const fetchPlaceData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/place/${place_id}`,
          {
            method: "GET",
            mode: "cors",
          },
        );
        const data = await response.json();
        console.log(data);
        if (data.status == "ok" && data.place != null) {
          setPlace(data.place);
          const aggregated_rating =
            parseInt(data.place.total_count) == 0
              ? 0
              : (parseInt(data.place.five_star_count) +
                  parseInt(data.place.four_star_count) +
                  parseInt(data.place.three_star_count) +
                  parseInt(data.place.two_star_count) +
                  parseInt(data.place.one_star_count)) /
                parseInt(data.place.total_count);
          setAggregatedRating(aggregated_rating);
        } else {
          throw new Error("No place found");
        }
      } catch (err) {
        console.error(err);
      }
      const bool = await isMod();
      setIsModerator(bool || false);
    };
    fetchPlaceData();
  }, [place_id]);

  useEffect(() => {
    const fetchPlaceReviews = async () => {
      const rating = searchParams.get("rating") || "5";
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/place/${place_id}/rating/${rating}`,
          {
            method: "get",
            mode: "cors",
          },
        );
        const data = await response.json();
        if (data.status == "ok") {
          setRatings(data.reviews);
        } else {
          setRatings(null);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlaceReviews();
  }, [place_id, searchParams]);

  const changeRatingQuery = (rating: string) => {
    setSearchParams({ rating: rating });
  };

  if (place == null) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="grid grid-cols-3">
      <div className="col-span-3 px-4">
        <div className="flex flex-col w-full bg-white mt-4 px-3 py-3 rounded-lg shadow-lg">
          <div className="relative">
            <img
              className="h-80 object-cover w-full"
              src="https://cdn.vox-cdn.com/thumbor/5d_RtADj8ncnVqh-afV3mU-XQv0=/0x0:1600x1067/1200x900/filters:focal(672x406:928x662)/cdn.vox-cdn.com/uploads/chorus_image/image/57698831/51951042270_78ea1e8590_h.7.jpg"
              alt="Place image missing"
            />
            <span
              className="drop-shadow-2xl font-extrabold text-3xl antialiased absolute top-1/2 left-1/2 text-white -translate-x-1/2 -translate-y-1/2
              "
            >
              {place.place.name}
            </span>
          </div>
          <div className="my-3">
            <span className="block text-xs text-gray-700">
              {place.place.display_name}
            </span>
          </div>
          <div className="grid grid-cols-2">
            <Map
              placeName={place.place.name}
              placeLocation={{
                lat: parseFloat(place.place.lat),
                long: parseFloat(place.place.long),
              }}
            />
            <div className="col-span-1 flex flex-col items-center">
              <div>
                <h1 className="text-lg font-light text-center">
                  Opening - closing time
                </h1>
                {place.place.opening_time != null &&
                place.place.closing_time != null ? (
                  <p className="font-light text-gray-600">
                    {DateTime.fromSQL(place.place.opening_time).toFormat(
                      "hh:mm a",
                    )}{" "}
                    -{" "}
                    {DateTime.fromSQL(place.place.closing_time).toFormat(
                      "hh:mm a",
                    )}
                  </p>
                ) : (
                  <p className="font-light text-sm text-gray-500">
                    This information is yet to be added
                  </p>
                )}
              </div>
              <div className="mt-2">
                <h1 className="text-lg font-light text-center">Open days</h1>
                {place.place.open_days != null &&
                place.place.open_days.length > 0 ? (
                  place.place.open_days.map((day: string) => (
                    <p className="font-light text-gray-600">
                      {day[0].toUpperCase() + day.slice(1)}
                    </p>
                  ))
                ) : (
                  <p className="font-light text-sm text-gray-500">
                    This information is yet to be added
                  </p>
                )}
              </div>
              <div className="mt-2">
                <h1 className="text-center font-light text-lg">
                  Place features
                </h1>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {place.place.place_features != null &&
                  place.place.place_features.length > 0 ? (
                    place.place.place_features.map((f: number) => {
                      const feature = place_features.find(
                        (data) => data.value == f,
                      );
                      return (
                        <span className="col-span-1 text-center font-light text-gray-600 border px-2 py-1 rounded-md cursor-pointer">
                          {feature?.label}
                        </span>
                      );
                    })
                  ) : (
                    <p className="font-light text-sm text-gray-500">
                      This information is yet to be added
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full justify-center mt-3">
            <button className="bg-green-700 text-white py-2 px-3 rounded-lg mx-3 shadow-lg">
              Write a review
            </button>
            <button className="bg-blue-900 text-white py-2 px-3 rounded-lg mx-2 shadow-lg">
              Bookmark this place
            </button>
            {isModerator && (
              <Link to={`/edit-place/${place.place.id}`}>
                <button className="bg-green-700 text-white py-2 px-3 rounded-lg mx-2 shadow-lg">
                  Edit place
                </button>
              </Link>
            )}
          </div>
          <div className="mt-4">
            <h1 className="text-xl font-bold">Top Reviews</h1>
            <div>
              <p className="text-sm my-2 flex italic">
                <span className="mr-2">
                  <FaQuoteLeft size={25} fill="gray" />
                </span>
                Bajeko Sekuwa offers a delightful culinary journey with its
                perfectly grilled meats and flavorful spices. A must-visit for
                anyone craving authentic Nepali flavors!
              </p>
            </div>
          </div>
          <div className="w-full border-t-2 my-3"></div>
          <div className="grid grid-cols-2 ">
            <div className="col-span-1 border-r-2 flex flex-col items-center">
              <span className="text-3xl">{aggregatedRating}</span>
              <div className="flex">
                <RatingStar size={25} filled={aggregatedRating} />
              </div>
              <div>{place.total_count} ratings</div>
            </div>
            <div className="col-span-1 flex flex-col items-center">
              <div className="flex">
                <RatingStar size={20} filled={5} />
                <span className="ml-3 w-5">{place.five_star_count}</span>
              </div>
              <div className="flex">
                <RatingStar size={20} filled={4} />
                <span className="ml-3 w-5">{place.four_star_count}</span>
              </div>
              <div className="flex">
                <RatingStar size={20} filled={3} />
                <span className="ml-3 w-5">{place.three_star_count}</span>
              </div>
              <div className="flex">
                <RatingStar size={20} filled={2} />
                <span className="ml-3 w-5">{place.two_star_count}</span>
              </div>
              <div className="flex">
                <RatingStar size={20} filled={1} />
                <span className="ml-3 w-5">{place.one_star_count}</span>
              </div>
            </div>
          </div>
          <div className="border-t-2 my-3 w-full"></div>
          <div className="w-full flex">
            <div
              className="rounded-md bg-gray-200 py-2 px-2 w-fit h-fit flex mx-2 cursor-pointer"
              onClick={() => changeRatingQuery("5")}
            >
              <IoIosStar size={22} fill="yellow" />
              <span className="self-center ml-2">5</span>
            </div>
            <div
              className="rounded-md bg-gray-200 py-2 px-2 w-fit h-fit flex mx-2 cursor-pointer"
              onClick={() => changeRatingQuery("4")}
            >
              <IoIosStar size={22} fill="yellow" />
              <span className="self-center ml-2">4</span>
            </div>
            <div
              className="rounded-md bg-gray-200 py-2 px-2 w-fit h-fit flex mx-2 cursor-pointer"
              onClick={() => changeRatingQuery("3")}
            >
              <IoIosStar size={22} fill="yellow" />
              <span className="self-center ml-2">3</span>
            </div>
            <div
              className="rounded-md bg-gray-200 py-2 px-2 w-fit h-fit flex mx-2 cursor-pointer"
              onClick={() => changeRatingQuery("2")}
            >
              <IoIosStar size={22} fill="yellow" />
              <span className="self-center ml-2">2</span>
            </div>
            <div
              className="rounded-md bg-gray-200 py-2 px-2 w-fit h-fit flex mx-2 cursor-pointer"
              onClick={() => changeRatingQuery("1")}
            >
              <IoIosStar size={22} fill="yellow" />
              <span className="self-center ml-2">1</span>
            </div>
          </div>
          <div className="border-t-2 my-3 w-full"></div>
          <div>
            {ratings != null ? (
              ratings.map((rating: any) => (
                <PlaceRating key={rating.id} review={rating} />
              ))
            ) : (
              <div className="w-full flex justify-center py-4">
                <div className="flex flex-col items-center">
                  <FaRegMehRollingEyes size={40} />
                  <p className="mt-2 text-gray-800">
                    No {searchParams.get("rating") || "5"} star reviews found
                    for this place
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
