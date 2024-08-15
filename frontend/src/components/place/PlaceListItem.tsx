import { Place } from "@/lib/types";
import { Rating } from "@mui/material";
import { Dot } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  place: Place;
};

const PlaceListItem = ({ place }: Props) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-[80%] px-4 py-2">
      <img
        className="w-[15rem] h-[15rem] object-cover rounded-md shadow"
        src={
          place.coverImgUrl ||
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Restaurant_N%C3%A4sinneula.jpg/800px-Restaurant_N%C3%A4sinneula.jpg"
        }
      />
      <div className="flex flex-col gap-1">
        <Link to={`/place/${place.id}`}>
          <h1 className="text-2xl font-bold">{place.name}</h1>
        </Link>
        <div className="flex flex-row gap-2 items-center">
          <p className="text-sm text-muted-foreground">
            412 rating{" "}
            <span className="font-bold text-sm text-black">(4.6)</span>
          </p>
          <p className="text-green-600 text-sm font-bold">Open</p>
        </div>
        <div className="flex flex-row gap-1 flex-wrap mt-2">
          {place.placeFeatures &&
            place.placeFeatures.slice(0, 3).map((feature, index) =>
              index == place.placeFeatures!.slice(0, 3).length - 1 ? (
                <span>{feature}</span>
              ) : (
                <span className="flex gap-1 items-center">
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
