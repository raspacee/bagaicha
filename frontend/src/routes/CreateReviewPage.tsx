import CreateReviewForm from "@/components/forms/CreateReviewForm";
import { useParams } from "react-router-dom";

const CreateReviewPage = () => {
  const { placeId } = useParams();

  return (
    <div className="px-2 w-full md:w-[50%]">
      <h1 className="font-extrabold text-3xl mb-4">Add Place Review</h1>
      <CreateReviewForm placeId={placeId as string} />
    </div>
  );
};

export default CreateReviewPage;
