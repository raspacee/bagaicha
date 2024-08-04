import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { IoIosRemoveCircleOutline } from "@react-icons/all-files/io/IoIosRemoveCircleOutline";
import { ReviewSchema, ReviewSchemaType } from "../lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "universal-cookie";
import { AUTH_TOKEN_NAME } from "../lib/config";
import { useNavigate } from "react-router-dom";

interface Place {
  id: string;
  name: string;
  lat: string;
  long: string;
  type: string;
  display_name: string;
}

const SUPPORTED_TYPES = ["webp", "jpeg", "jpg", "png"];

const isValidFiletype = (filepath: string) => {
  const split = filepath.split("\\");
  const filename = split[split.length - 1];
  if (SUPPORTED_TYPES.includes(filename.split(".")[1])) return true;
  return false;
};

export default function CreateReview() {
  const navigate = useNavigate();
  const cookies = new Cookies(null, {
    path: "/",
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewSchemaType>({
    resolver: zodResolver(ReviewSchema),
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [query, setQuery] = useState<string>("");
  const [foodsList, setFoodsList] = useState<string[]>([]);
  const [foodAte, setFoodAte] = useState<string>("");
  const [placeInfo, setPlaceInfo] = useState<Place | null>(null);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [pictureError, setPictureError] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [imgUploaded, setImgUploaded] = useState<boolean>(false);

  const pictureRef = useRef<HTMLInputElement>(null);
  const ratingRef = useRef<HTMLSelectElement>(null);

  const onSubmit = async (data: any) => {
    if (placeInfo == null) {
      setPlaceError(
        "You can only choose places that show in the suggestion box. Please choose from that only."
      );
    } else {
      setPlaceError(null);
    }
    if (pictureRef.current!.value == "") {
      setPictureError("Please upload a picture");
    } else {
      setPictureError(null);
    }
    if (ratingRef.current!.value == "0") {
      setRatingError("Please select a rating");
    } else {
      setRatingError(null);
    }
    if (
      placeInfo != null &&
      pictureRef.current!.value != null &&
      ratingRef.current!.value != "0"
    ) {
      const formData = new FormData();
      formData.append("picture", pictureRef.current!.files![0]);
      formData.append("comment", data.comment);
      formData.append("place_id", placeInfo.id);
      formData.append("place_name", placeInfo.name);
      formData.append("display_name", placeInfo.display_name);
      formData.append("place_lat", placeInfo.lat);
      formData.append("place_long", placeInfo.long);
      formData.append("foods_ate", JSON.stringify(foodsList));
      formData.append("rating", ratingRef.current!.value);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/review`, {
          method: "POST",
          body: formData,
          mode: "cors",
          headers: {
            authorization: `Bearer ${cookies.get(AUTH_TOKEN_NAME)}`,
          },
        });
        const result = await response.json();
        if (result.status == "ok") {
          navigate("/feed");
        } else {
          setErrorMsg(result.message);
        }
      } catch (err) {
        setErrorMsg("Something went wrong, failed to post your review");
      }
    }
  };

  const getSuggestions = async (query: string) => {
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
    setPlaceError(null);
  };

  const handleFoodAte = (value: string) => {
    if (value[value.length - 1] == " " && value.trim() != "") {
      setFoodsList((prev) => [...prev, value.trim()]);
      setFoodAte("");
    } else {
      setFoodAte(value);
    }
  };

  const removeFoodFromList = (value: string) => {
    setFoodsList((prev) => prev.filter((f) => f !== value));
  };

  return (
    <div className="grid grid-cols-3 px-4">
      <div className="col-span-2 bg-white w-full py-5 px-4 mt-3 rounded-lg shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="text-center">
          <div className="mt-4">
            <div className="w-full grid gap-2 grid-cols-2">
              <label
                htmlFor=""
                className="col-span-1 self-center font-regular text-lg antialiased"
              >
                Where were you at?
              </label>
              <div className="col-span-1">
                <input
                  className="py-2 px-4 border-2 bg-gray-200 border-gray-200 w-full outline-none rounded-md"
                  type="text"
                  autoComplete="off"
                  placeholder="search the place"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    onChange(e.target.value);
                  }}
                />
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
          </div>
          <div id="place-error" aria-live="polite" aria-atomic="true">
            {placeError != null && (
              <p className="mt-1 text-sm text-red-500">{placeError}</p>
            )}
          </div>
          <div className="mt-5">
            <div className="w-full grid gap-2 grid-cols-2">
              <label
                htmlFor=""
                className="col-span-1 font-regular text-lg self-center"
              >
                Choose a picture
              </label>
              <label
                htmlFor="picture"
                className="border py-2 bg-blue-500 text-white border-blue-500 rounded-md cursor-pointer"
              >
                {imgUploaded ? "Uploaded " : "Upload picture"}
              </label>
              <input
                id="picture"
                className="ml-4"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                hidden
                ref={pictureRef}
                onChange={(e) => setImgUploaded(true)}
              />
            </div>
          </div>
          <div id="picture-error" aria-live="polite" aria-atomic="true">
            {pictureError && (
              <p className="mt-1 text-sm text-red-500">{pictureError}</p>
            )}
          </div>
          <div className="mt-5">
            <div className="grid gap-2 grid-cols-2">
              <label htmlFor="" className="font-regular text-lg">
                How was the food?
              </label>
              <textarea
                className="w-full h-20 bg-gray-200 border-2 border-gray-200 py-2 px-2 rounded-md outline-none"
                placeholder="describe it"
                {...register("comment")}
              />
            </div>
          </div>
          <div id="comment-error" aria-live="polite" aria-atomic="true">
            {errors.comment && (
              <p className="mt-1 text-sm text-red-500">
                {errors.comment.message}
              </p>
            )}
          </div>
          <div className="mt-5">
            <label className="font-regular text-lg">What did you eat?</label>
            <div className="w-full flex">
              <div className="flex">
                {foodsList.map((f) => (
                  <span className="mx-1 flex items-center" key={f}>
                    <span>{f}</span>
                    <span
                      className="ml-0.5 cursor-pointer"
                      onClick={() => removeFoodFromList(f)}
                    >
                      <IoIosRemoveCircleOutline size={15} />
                    </span>
                  </span>
                ))}
              </div>
              <div className="flex-1">
                <input
                  value={foodAte}
                  onChange={(e) => {
                    handleFoodAte(e.target.value);
                  }}
                  className="mt-2 outline-none bg-gray-200 w-full 
                border-2 border-gray-200 rounded-md py-2 px-3"
                  placeholder="press space after typing the food"
                />
              </div>
            </div>
          </div>
          <div className="my-4">
            <div className="grid gap-1 grid-cols-2">
              <label
                htmlFor=""
                className="col-span-1 font-regular text-lg outline-none"
              >
                Rate the food
              </label>
              <select
                required
                name="rating"
                className="col-span-1 py-2 px-2 rounded-md"
                defaultValue="0"
                ref={ratingRef}
              >
                <option disabled value="0">
                  Select star
                </option>
                <option value="1">1 star</option>
                <option value="2">2 star</option>
                <option value="3">3 star</option>
                <option value="4">4 star</option>
                <option value="5">5 star</option>
              </select>
            </div>
          </div>
          <div id="rating-error" aria-live="polite" aria-atomic="true">
            {ratingError != null && (
              <p className="mt-1 text-sm text-red-500">{ratingError}</p>
            )}
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="py-2 px-6 text-lg rounded-lg bg-green-700 text-white"
            >
              Post
            </button>
          </div>
          <div id="server-error" aria-live="polite" aria-atomic="true">
            {errorMsg != null && (
              <p className="mt-1 text-sm text-red-500">{errorMsg}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
