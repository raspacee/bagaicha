import { useGetMyPlaces } from "@/api/PlaceApi";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";

const ManagePlaces = () => {
  const { places, isLoading } = useGetMyPlaces();
  const navigate = useNavigate();

  if (isLoading) {
    return <h1>Loading</h1>;
  }

  return (
    <div className="w-full md:w-[70%] px-2 md:px-4 py-2">
      <h1 className="text-3xl font-extrabold mb-4">Manage My Places</h1>
      <div className="flex flex-col gap-4">
        {places && places.length == 0 && (
          <h1 className="text-lg">You don't own any place</h1>
        )}
        {places &&
          places.length > 0 &&
          places.map((place) => (
            <>
              <div className="flex flex-col md:flex-row gap-2 py-1">
                <div className="w-full md:w-[50%]">
                  <AspectRatio ratio={16 / 9}>
                    <img
                      src={place.coverImgUrl}
                      className="w-full h-full rounded-md"
                    />
                  </AspectRatio>
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className="text-xl font-medium">{place.name}</p>
                  <p className="text-muted-foreground">{`Created On ${DateTime.fromISO(
                    place.createdAt
                  ).toFormat("DDD")}`}</p>
                  <Button
                    className="w-[8rem] rounded-md mt-3"
                    onClick={() => navigate(`/place/${place.id}/edit`)}
                  >
                    Manage
                  </Button>
                </div>
              </div>
              <Separator />
            </>
          ))}
      </div>
    </div>
  );
};

export default ManagePlaces;
