import { useGetPlaceData } from "@/api/PlaceApi";
import UpdatePlaceForm from "@/components/forms/UpdatePlaceForm";
import { useParams } from "react-router-dom";

const EditPlacePage = () => {
  const { placeId } = useParams();
  const { place, isLoading } = useGetPlaceData(placeId as string);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!place) {
    return <h1>Place not found</h1>;
  }

  return (
    <div className="h-fit w-full md:w-[80%] flex flex-col items-center gap-2 bg-white rounded-md shadow px-4 py-6">
      <h1 className="text-3xl font-bold">Update Place Information</h1>
      <UpdatePlaceForm place={place} />
    </div>
  );
};

export default EditPlacePage;
