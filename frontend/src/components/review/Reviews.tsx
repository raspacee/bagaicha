import { useGetAllReviews } from "@/api/PlaceReviewApi";
import { Loader2, Plus } from "lucide-react";
import Review from "./Review";
import { Separator } from "../ui/separator";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReviewFilterBy, ReviewSortBy } from "@/lib/types";
import { useState } from "react";

type Props = {
  placeId: string;
};

const Reviews = ({ placeId }: Props) => {
  const [sortBy, setSortBy] = useState<ReviewSortBy | undefined>(undefined);
  const [filterBy, setFilterBy] = useState<ReviewFilterBy | undefined>(
    undefined
  );
  const { isPending, reviews } = useGetAllReviews(placeId, sortBy, filterBy);

  return (
    <div className="p-0">
      <h1 className="font-bold text-3xl mb-3">Reviews</h1>
      <Link to="review/add">
        <Button className="flex gap-2 mb-5 px-8">
          {" "}
          <Plus /> Post a review
        </Button>
      </Link>

      <div className="mb-5 flex flex-row gap-8">
        <Select onValueChange={(value) => setSortBy(value as ReviewSortBy)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => setFilterBy(value as ReviewFilterBy)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter By Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">One Star</SelectItem>
            <SelectItem value="2">Two Star</SelectItem>
            <SelectItem value="3">Three Star</SelectItem>
            <SelectItem value="4">Four Star</SelectItem>
            <SelectItem value="5">Five Star</SelectItem>
            <SelectItem value="all">All Star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <Loader2 className="animate-spin my-2" size={64} />
      ) : (
        <div className="flex flex-col gap-5">
          {reviews ? (
            reviews.map((review) => (
              <>
                <Review review={review} />
                <Separator />
              </>
            ))
          ) : (
            <h2 className="text-lg">No reviews found</h2>
          )}
        </div>
      )}
    </div>
  );
};

export default Reviews;
