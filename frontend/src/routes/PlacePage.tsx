import { useGetPlaceData } from "@/api/PlaceApi";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link, useNavigate, useParams } from "react-router-dom";
import PlaceInformationCard from "@/components/place/PlaceInformationCard";
import FoodsMenuCard from "@/components/place/FoodsMenuCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuthenticateUser } from "@/api/AuthApi";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import UploadImages from "@/components/post/UploadImages";
import ImagesList from "@/components/place/ImagesList";

const PlacePage = () => {
  const { placeId } = useParams();
  const { data, isLoading: isUserLoading } = useAuthenticateUser();
  const { place, isLoading } = useGetPlaceData(placeId as string);

  const navigate = useNavigate();

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

          {!isUserLoading && data?.user?.userId == place.ownedBy && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" className="w-24 rounded-full">
                  Edit
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => navigate("edit")}>
                  Edit Place
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ImagesList placeId={placeId as string} />

          <div className="flex mt-4 gap-2">
            <UploadImages placeId={placeId as string} />
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 w-full">
        <PlaceInformationCard place={place} />
        <FoodsMenuCard
          foodsOffered={place.foodsOffered || []}
          header="Foods Menu"
          description="Delicious foods served by this place"
        />
      </div>
      <div className="w-full">
        <MapContainer
          center={[place.lat, place.lon]}
          zoom={14}
          scrollWheelZoom={false}
          className="w-full h-[20rem]"
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
      {place.ownedBy == null && (
        <Link to="request-ownership">
          <p className="text-lg hover:text-blue-900">
            Are you this place's owner?
          </p>
        </Link>
      )}
    </div>
  );
};

export default PlacePage;
