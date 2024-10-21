import { useGetPlaceData } from "@/api/PlaceApi";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link, useParams } from "react-router-dom";
import PlaceInformationCard from "@/components/place/PlaceInformationCard";
import FoodsMenuCard from "@/components/place/FoodsMenuCard";
import { useAuthenticateUser } from "@/api/AuthApi";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import UploadImages from "@/components/post/UploadImages";
import ImagesList from "@/components/place/ImagesList";
import {
  CheckCheck,
  ExternalLink,
  Instagram,
  Milestone,
  Phone,
  Settings,
} from "lucide-react";
import PlaceMenu from "@/components/place/PlaceMenu";
import Reviews from "@/components/review/Reviews";
import { Separator } from "@/components/ui/separator";
import { Rating } from "@mui/material";
import { useFetchPlaceFeatures } from "@/api/FeatureApi";
import { Badge } from "@/components/ui/badge";
import { useGetMyUserData } from "@/api/UserApi";
import { Button } from "@/components/ui/button";

const PlacePage = () => {
  const { placeId } = useParams();
  const { data, isLoading: isUserLoading } = useAuthenticateUser();
  const { myUser } = useGetMyUserData();
  const { place, isLoading } = useGetPlaceData(placeId as string);
  const { placeFeatures, isLoading: isFeaturesLoading } = useFetchPlaceFeatures(
    placeId as string
  );

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!place) {
    return <h1>Place not found</h1>;
  }

  return (
    <div className="w-full h-fit bg-white rounded-md shadow flex flex-col gap-4 items-center py-4 px-6">
      <div className="w-full h-[28rem] relative">
        <AspectRatio ratio={16 / 9}>
          <img
            src={
              place.coverImgUrl ||
              "https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg"
            }
            className="rounded-md h-[28rem] object-cover w-full"
            alt="Place picture here"
          />
        </AspectRatio>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 gap-5">
          <h1 className="text-white font-extrabold text-5xl  drop-shadow-md ">
            {place.name}
          </h1>
          <span className="flex flex-col md:flex-row gap-2 text-white font-semibold text-lg">
            {place.rating && (
              <Rating
                value={place.rating}
                size="large"
                readOnly
                precision={0.1}
              />
            )}
            <p>
              {place.rating
                ? parseFloat(place.rating.toString()).toFixed(1)
                : "Not Rated"}
            </p>
            <p>({place.totalReviews} reviews)</p>
          </span>

          <div className="flex flex-col gap-2 items-start">
            <ImagesList placeId={placeId as string} />

            {myUser && <UploadImages placeId={placeId as string} />}
          </div>

          {!isUserLoading && myUser?.id === place.ownedBy && (
            <Link
              to="edit"
              className="my-4 border bg-transparent text-white font-semibold py-2 px-5 rounded-md bg-opacity-80 flex gap-2 w-fit"
            >
              <Settings />
              Edit Information
            </Link>
          )}
        </div>
      </div>
      <div className="flex gap-2 w-full flex-wrap">
        {placeFeatures &&
          placeFeatures.map((feature) => (
            <Badge
              key={feature.id}
              className="text-md py-1 px-3 gap-2"
              variant="outline"
            >
              <CheckCheck className="text-green-600" />
              {feature.featureName}
            </Badge>
          ))}
      </div>
      <div className="flex flex-col md:flex-row gap-2 w-full">
        <PlaceInformationCard place={place} />
        <div className="border px-4 py-2 rounded-md flex-1 flex-col md:flex-row gap-2 items-center justify-center z-0">
          <Button
            className="px-0 my-0 py-0 text-blue-600 font-semibold flex gap-4"
            variant="link"
          >
            Get Directions
            <Milestone className="text-black" />
          </Button>
          <p className="mb-2 font-medium">{`${place.road}, ${place.neighbourhood}, ${place.city}`}</p>
          <MapContainer
            center={[place.lat, place.lon]}
            zoom={14}
            scrollWheelZoom={false}
            className="h-[15rem]"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[place.lat, place.lon]}>
              <Popup>Place Located Here!</Popup>
            </Marker>
          </MapContainer>
        </div>
        {/* <FoodsMenuCard
          foodsOffered={place.foodsOffered || []}
          header="Foods Menu"
          description="Delicious foods served by this place"
        /> */}
      </div>
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="border rounded-md flex flex-col gap-2 px-5 py-3 col-span-1 h-fit">
          <a
            href={place.websiteLink}
            className="flex justify-between w-full py-1"
            target="_blank"
            onClick={(e) => {
              if (!place.websiteLink) e.preventDefault();
            }}
          >
            <span
              className={`${place.websiteLink && "text-blue-600 font-bold "}`}
            >
              {place.websiteLink
                ? new URL(place.websiteLink).hostname
                : "Website Not Provided"}
            </span>
            <ExternalLink />
          </a>
          <Separator />
          <a
            href={place.instagramLink}
            className="flex justify-between py-1"
            target="_blank"
          >
            <span
              className={`${place.instagramLink && "text-blue-600 font-bold "}`}
            >
              {place.instagramLink
                ? new URL(place.instagramLink).pathname.replace(
                    new RegExp("/", "g"),
                    ""
                  )
                : "Instagram Not Provided"}
            </span>
            <Instagram />
          </a>
          <Separator />
          <span className="flex justify-between py-1">
            <span className="flex flex-col gap-1">
              {place.contactNumbers ? (
                place.contactNumbers.map((number) => (
                  <p className="font-normal cursor-pointer">{number}</p>
                ))
              ) : (
                <p>Contact Not Provided</p>
              )}
            </span>
            <Phone />
          </span>
        </div>
        <div className="grid col-span-2 border rounded-md px-5 py-3">
          <h1 className="text-xl font-semibold text-center mb-3">Menu</h1>
          <PlaceMenu placeId={placeId as string} />
        </div>
      </div>
      <Separator />
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
        <Reviews placeId={placeId as string} />
      </div>
      {place.ownedBy == null && (
        <Link to="request-ownership">
          <p className="text-lg hover:text-blue-900">
            Are you this place's owner?
          </p>
        </Link>
      )}
      <div className="min-h-[10rem]"></div>
    </div>
  );
};

export default PlacePage;
