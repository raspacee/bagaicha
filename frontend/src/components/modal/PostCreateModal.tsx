import { MdCancel } from "@react-icons/all-files/md/MdCancel";
import { IoLocationSharp } from "@react-icons/all-files/io5/IoLocationSharp";
import { IoImagesOutline } from "@react-icons/all-files/io5/IoImagesOutline";

import Avatar from "@mui/material/Avatar";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Rating from "@mui/material/Rating";

import { useAppSelector, useAppDispatch } from "../../hooks.ts";
import {
  clearPostCreateModal,
  setPostCreateModal,
} from "../../slice/modalSlice.ts";
import { ReviewSchema, ReviewSchemaType } from "../../lib/schemas";
import { createReview } from "../../api/reviewApi.ts";
import { useSearchParams } from "react-router-dom";

interface Place {
  id: string;
  name: string;
  lat: string;
  long: string;
  type: string;
  display_name: string;
}

export default function PostCreate() {
  const dispatch = useAppDispatch();
  const display = useAppSelector(
    (state) => state.modal.postCreateModal.display
  );
  const user = useAppSelector((state) => state.user);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [query, setQuery] = useState<string>("");
  const [placeInfo, setPlaceInfo] = useState<Place | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    register,
    setError,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReviewSchemaType>({
    resolver: zodResolver(ReviewSchema),
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const formData = new FormData();
      formData.append("picture", data.picture);
      formData.append("comment", data.comment);
      formData.append("place_id", placeInfo!.id);
      formData.append("place_name", placeInfo!.name);
      formData.append("display_name", placeInfo!.display_name);
      formData.append("place_lat", placeInfo!.lat);
      formData.append("place_long", placeInfo!.long);
      formData.append("rating", rating!.toString());
      return createReview(formData);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["reviews", searchParams.get("sort") || "trending"],
        (oldData: any) => {
          if (oldData) return [data, ...oldData];
          return [data];
        }
      );
      dispatch(setPostCreateModal({ value: false }));
      dispatch(clearPostCreateModal());
    },
    onError: () => {
      setError("root", {
        type: "manual",
        message: "Something went wrong, try again",
      });
    },
  });

  const closeModal = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if ((e.target as HTMLInputElement).id != "modal-post-create") {
      dispatch(setPostCreateModal({ value: false }));
    }
  };
  const fetchFromOpenmap = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&countrycodes=NP`
      );
      const result = await response.json();
      const sugges: Place[] = [];
      for (let i = 0; i < result.length; i++) {
        const tmp = result[i].display_name.split(",");
        sugges.push({
          id: result[i].place_id,
          name: `${tmp[0]}, ${tmp[1]}`,
          lat: result[i].lat,
          long: result[i].lon,
          type: result[i].type,
          display_name: result[i].display_name,
        });
        if (i == 4) break;
      }
      setSuggestions(sugges);
      fetchFromBackend();
    } catch (err) {
      console.log(err);
    }
  };

  const fetchFromBackend = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/place/search?q=${query}`
      );
      const result = await response.json();
      console.log(result);
      if (result.places != null) {
        setSuggestions((oldSugges) => {
          const newSugges: Place[] = [];
          for (let i = 0; i < result.places.length; i++) {
            const tmp = result.places[i].name.split(",");
            newSugges.push({
              id: result.places[i].openmaps_place_id,
              name: result.places[i].name,
              lat: result.places[i].lat,
              long: result.places[i].long,
              type: "tmp",
              display_name: result.places[i].display_name,
            });
            if (i == 3) break;
          }
          console.log(newSugges);
          return newSugges.concat(oldSugges);
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getSuggestions = async (query: string) => {
    fetchFromOpenmap();
  };
  const onChange = useDebouncedCallback((value: string) => {
    if (value.trim() == "") {
      setSuggestions([]);
    } else {
      getSuggestions(value);
    }
  }, 100);

  const handleSuggestionClick = (place: Place) => {
    setPlaceInfo(place);
    setSuggestions([]);
    setQuery(place.name);
    setValue("place", place);
  };

  const onSubmit = async (data: any) => {
    if (placeInfo == null || !rating || ![1, 2, 3, 4, 5].includes(rating))
      return;
    mutation.mutate(data);
  };

  if (!display) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80">
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        id="modal-post-create"
        className="
        p-2 w-3/5 h-5/6 grid grid-rows-6 gap-1
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 z-50"
      >
        <div className="w-full px-4 py-2 flex justify-between row-span-1">
          <div className="flex items-center">
            <Avatar alt={user.first_name} src={user.profile_picture_url} />
            <h1 className="font-bold text-lg ml-2">
              {user.first_name} {user.last_name}
            </h1>
          </div>
          <motion.div
            onClick={closeModal}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <MdCancel size={40} className="text-gray-600 cursor-pointer" />
          </motion.div>
        </div>
        <div className="mt-3 px-4 overflow-y-scroll row-span-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-1 flex">
              <IoLocationSharp size={35} className="text-red-500 mr-2" />
              <div>
                <input
                  className="py-2 px-4 border-2 bg-gray-200 border-gray-200 w-full rounded-md focus:outline-none focus:ring-0"
                  type="text"
                  autoComplete="off"
                  placeholder="search the place"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    onChange(e.target.value);
                  }}
                />
                <input type="text" hidden {...register("place")} />
                {errors.place && (
                  <p className="mt-2 text-red-500">
                    {errors.place.message as string}
                  </p>
                )}
                <div className="relative">
                  <div className="w-full absolute top-0 left-0 bg-gray-200">
                    {suggestions.map((s) => (
                      <p
                        className="cursor-pointer border-t border-gray-300 py-1"
                        onClick={() => handleSuggestionClick(s)}
                        key={s.id}
                      >
                        {s.name}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-1">
              <div className="flex items-center">
                <label
                  htmlFor=""
                  className="col-span-1 font-medium text-base text-gray-600 outline-none mr-2"
                >
                  Rate the food
                </label>
                <Rating
                  name="rating"
                  value={rating}
                  size="large"
                  onChange={(event, newValue) => {
                    setRating(newValue!);
                    setValue("rating", newValue!.toString(), {
                      shouldValidate: true,
                    });
                  }}
                />
                <input id="rating" type="text" {...register("rating")} hidden />
              </div>
              <div>
                <p className="text-red-500">
                  {errors.rating && errors.rating.message}
                </p>
              </div>
            </div>
          </div>
          <div className="my-2">
            <textarea
              className="w-full h-[200px] text-lg resize-none border-none focus:outline-none focus:ring-0"
              placeholder="How was the food"
              {...register("comment")}
            />
          </div>
          <div id="comment-error" aria-live="polite" aria-atomic="true">
            {errors.comment && (
              <p className="mt-1 text-sm text-red-500">
                {errors.comment.message}
              </p>
            )}
          </div>
          <div>
            {image != null && <img src={image} style={{ width: "95%" }} />}
          </div>
        </div>
        <div className="text-center w-full row-span-1">
          <div className="w-full my-2 border-t border-t-gray-400"></div>
          <div className="flex justify-between">
            <div className="px-5 flex items-center">
              <label htmlFor="picture">
                <IoImagesOutline
                  size={28}
                  className="text-gray-600 cursor-pointer"
                />
              </label>
              {errors.picture && (
                <p className="text-red-500 ml-2">
                  {errors.picture.message as string}
                </p>
              )}
              <input
                id="picture"
                className="ml-4"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                hidden
                {...register("picture")}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImage(URL.createObjectURL(e.target.files[0]));
                    setValue("picture", e.target.files[0]);
                  }
                }}
              />
            </div>
            <div className="flex justify-between px-4">
              <div className="flex items-center">
                <p className="text-red-500">
                  {errors.root && errors.root.message}
                </p>
              </div>
              <div className="flex">
                <button className="bg-gray-500 px-4 py-2 text-white rounded-full mr-4 font-medium">
                  Save draft
                </button>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.9,
                  }}
                  type="submit"
                  className="bg-blue-800 px-6 py-2 text-white rounded-full font-medium"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Submitting" : "Post"}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
