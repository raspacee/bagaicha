import { Link } from "react-router-dom";

import RatingStar from "./RatingStar";
import { place_features } from "../../routes/edit_place";

export default function FindPlacesItem({
  place,
  index,
}: {
  place: any;
  index: number;
}) {
  const handleBrokenImg = (e: any) => {
    e.target.src = "https://www.usm.edu/images/image-not-available_1.jpg";
  };
  return (
    <Link to={`/place/${place.id}`}>
      <div className="px-4 py-3 my-3 bg-white rounded-md grid gap-1 grid-cols-3 h-fit cursor-pointer">
        <div className="col-span-1">
          <img
            src={
              place.thumbnail_img_url ||
              "https://www.usm.edu/images/image-not-available_1.jpg"
            }
            onError={handleBrokenImg}
            className="w-full h-full rounded-md"
          />
        </div>
        <div className="col-span-2 px-4">
          <h2 className="font-medium text-xl">
            {index}. {place.name.split(",")[0]}{" "}
            <span className="font-light text-md ml-2">{place.distance} km</span>
          </h2>
          <div className="flex items-center">
            <RatingStar size={25} filled={Math.round(place.avg_rating)} />
            <div className="mx-2">
              <span className="font-medium">
                {Number(place.avg_rating).toFixed(2)}
              </span>
              <span className="font-light text-gray-600 ml-2">
                ({place.total_reviews} reviews)
              </span>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-gray-600">Opens 9:00 AM to 5:00 PM</p>
            <p className="text-gray-600">{place.name.split(",")[1]}</p>
          </div>
          <h2 className="font-medium mt-3">Offers</h2>
          <div className="mt-2">
            {place.place_features?.map((f: any, index: number) => {
              if (index == 3) return;
              const feature = place_features.find((data) => data.value == f);
              return (
                <span
                  key={feature?.label}
                  className="mr-2 font-light border px-3 py-2 rounded-md"
                >
                  {feature?.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </Link>
  );
}
