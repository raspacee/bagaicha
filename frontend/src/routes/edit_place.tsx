import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Cookies from "universal-cookie";
import { AUTH_TOKEN } from "../lib/cookie_names";

const checkboxes = [
  { label: "Sunday", value: "sunday" },
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
];

export const place_features = [
  { label: "Offers delivery", value: 0 },
  { label: "Offers takeout", value: 1 },
  { label: "Pet friendly", value: 2 },
  { label: "Very clean", value: 3 },
  { label: "Affordable", value: 4 },
];

export default function EditPlace() {
  const cookies = new Cookies(null, {
    path: "/",
  });
  const [place, setPlace] = useState<any>(null);
  const [placeFeatures, setPlaceFeatures] = useState<number[]>([]);
  const [openDays, setOpenDays] = useState<string[]>([]);
  const openingTimeRef = useRef<HTMLInputElement>(null);
  const closingTimeRef = useRef<HTMLInputElement>(null);
  const coverImgRef = useRef<HTMLInputElement>(null);
  const thumbnailImgRef = useRef<HTMLInputElement>(null);
  const { place_id } = useParams();

  useEffect(() => {
    const fetchPlace = async () => {
      const options = {
        method: "get",
      };
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/place/${place_id}`,
        options,
      );
      const data = await res.json();
      console.log(data.place.place);
      setPlace(data.place.place);
      setPlaceFeatures(data.place.place.place_features || []);
      setOpenDays(data.place.place.open_days || []);
    };
    fetchPlace();
  }, []);

  const handleSubmit = async () => {
    const formData = new FormData();

    if (
      (openingTimeRef.current?.value != "" &&
        closingTimeRef.current?.value == "") ||
      (openingTimeRef.current?.value == "" &&
        closingTimeRef.current?.value != "")
    ) {
      return;
    }

    formData.append("open_days", JSON.stringify(openDays));
    formData.append(
      "opening_time",
      JSON.stringify(openingTimeRef.current?.value),
    );
    formData.append(
      "closing_time",
      JSON.stringify(closingTimeRef.current?.value),
    );
    formData.append("place_features", JSON.stringify(placeFeatures));

    if (coverImgRef.current?.files?.length == 1) {
      formData.append("cover_img", coverImgRef.current?.files[0]);
    } else {
      formData.append("cover_img_old", place.cover_img_url);
    }

    if (thumbnailImgRef.current?.files?.length == 1) {
      formData.append("thumbnail_img", thumbnailImgRef.current?.files[0]);
    } else {
      formData.append("thumbnail_img_old", place.thumbnail_img_url);
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/place/${place_id}`,
        {
          mode: "cors",
          method: "put",
          body: formData,
          headers: {
            authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
          },
        },
      );
      const data = await res.json();
      if (data.status == "ok") {
        alert("Update successful");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDaysChange = (day: string) => {
    if (!openDays.includes(day)) {
      setOpenDays((prevState) => [...prevState, day]);
    } else {
      setOpenDays((prevState) => prevState.filter((d) => d != day));
    }
  };

  const handlePlaceFeatures = (value: number) => {
    if (!placeFeatures.includes(value)) {
      setPlaceFeatures((prevState) => [...prevState, value]);
    } else {
      setPlaceFeatures((prevState) => prevState.filter((d) => d != value));
    }
  };

  if (place == null) {
    return <h1>Place not found</h1>;
  }

  return (
    <div className="grid grid-cols-3 gap-1 px-4 mt-3">
      <div className="col-span-2 px-4 py-3 bg-white rounded-md">
        <div>
          <h1 className="text-2xl">Editing Place</h1>
          <h2 className="text-xl font-normal">{place.name}</h2>
          <label>Cover Image</label>
          <img src={place.cover_img_url} width="200" height="100" />
          <label>Thumbnail Image</label>
          <img src={place.thumbnail_img_url} alt="Image missing" />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <fieldset className="border-2 px-4 py-1">
              <legend className="text-gray-600 text-lg font-light">
                Images
              </legend>
              <input type="file" name="thumbnail_img" ref={thumbnailImgRef} />
              <label>Thumbnail picture</label>
              <input
                type="file"
                name="cover_img"
                ref={coverImgRef}
                className="mt-1"
              />
              <label>Cover picture</label>
            </fieldset>
            <fieldset className="border-2 px-4 py-1">
              <legend className="text-gray-600 text-lg font-light">
                Open days
              </legend>
              <div>
                {checkboxes.map((checkbox) => {
                  return (
                    <div key={checkbox.label} className="mb-1">
                      <input
                        type="checkbox"
                        value={checkbox.value}
                        checked={openDays?.includes(checkbox.value)}
                        onChange={() => handleDaysChange(checkbox.value)}
                        id={checkbox.value}
                      />
                      <label className="ml-2" htmlFor={checkbox.value}>
                        {checkbox.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
            <fieldset className="border-2 px-4 py-1">
              <legend className="text-gray-600 text-lg font-light">
                Work hours
              </legend>
              <div>
                <div>
                  <h2>Opening time</h2>
                  <input
                    type="time"
                    ref={openingTimeRef}
                    defaultValue={place.opening_time?.split("+")[0]}
                  />
                </div>
                <div>
                  <h2>Closing time</h2>
                  <input
                    type="time"
                    ref={closingTimeRef}
                    defaultValue={place.closing_time?.split("+")[0]}
                  />
                </div>
              </div>
            </fieldset>
            <fieldset className="border-2 px-4 py-1">
              <legend className="font-light text-lg text-gray-600">
                Place features
              </legend>
              <div>
                {place_features.map((f) => {
                  return (
                    <div key={f.label} className="mb-1">
                      <input
                        type="checkbox"
                        value={f.value}
                        checked={placeFeatures?.includes(f.value)}
                        onChange={() => handlePlaceFeatures(f.value)}
                        id={f.label}
                      />
                      <label className="ml-2" htmlFor={f.label}>
                        {f.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
            <button
              type="submit"
              className="border px-4 py-2 my-2 bg-blue-700 text-white rounded-md"
            >
              Save changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
