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
      <div className="flex gap-4 items-center">
        <h1 className="text-3xl font-extrabold">{place.name}</h1>
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
      </div>
      <div className="w-full h-[28rem]">
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
      </div>
      <div className="flex flex-col md:flex-row gap-2 w-full">
        <PlaceInformationCard place={place} />
        <FoodsMenuCard
          foodsOffered={place.foodsOffered || []}
          header="Foods Menu"
          description="Delicious foods served by this place"
        />
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
