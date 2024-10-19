import { PlaceWithRating } from "@/lib/types";
import { Rating } from "@mui/material";
import { Dot } from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "../ui/separator";

type Props = {
  place: PlaceWithRating;
};

const PlaceListItem = ({ place }: Props) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-[80%] px-4 py-2 items-center">
      <img
        className="w-[15rem] h-[15rem] object-cover rounded-md shadow"
        src={
          place.coverImgUrl ||
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Restaurant_N%C3%A4sinneula.jpg/800px-Restaurant_N%C3%A4sinneula.jpg"
        }
      />
      <div className="flex flex-col w-[80%]">
        <Link to={`/place/${place.id}`}>
          <h1 className="text-xl font-bold">{place.name}</h1>
        </Link>
        <div className="flex flex-col">
          <p className="text-sm flex gap-2 items-center">
            <Rating value={place.rating} readOnly />
            <span className="">
              {place.rating
                ? `(${parseFloat(place.rating.toString()).toFixed(1)})`
                : "(Not Rated)"}
            </span>
          </p>
          <p className="px-1 text-muted-foreground font-normal">{`${
            place.totalReviews || 0
          } reviews`}</p>
        </div>
        <div className="flex flex-row gap-1 flex-wrap mt-2">
          {place.placeFeatures &&
            place.placeFeatures.slice(0, 3).map((feature, index) =>
              index == place.placeFeatures!.slice(0, 3).length - 1 ? (
                <span key={feature}>{feature}</span>
              ) : (
                <span key={feature} className="flex gap-1 items-center">
                  {feature} <Dot />
                </span>
              )
            )}
        </div>
      </div>
    </div>
  );
};

export default PlaceListItem;
