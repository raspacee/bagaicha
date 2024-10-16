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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
  placeId: string;
};

const Reviews = ({ placeId }: Props) => {
  const [sortBy, setSortBy] = useState<ReviewSortBy | undefined>(undefined);
  const [filterBy, setFilterBy] = useState<ReviewFilterBy | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { isPending, reviewsResponse } = useGetAllReviews(
    placeId,
    sortBy,
    filterBy,
    currentPage
  );

  if (!isPending && !reviewsResponse) {
    return <h1>Error while getting reviews</h1>;
  }

  const renderPages = () => {
    const OFFSET = 4;
    const left = currentPage - OFFSET >= 1 ? currentPage - OFFSET : 1;
    const right =
      currentPage + OFFSET <= reviewsResponse!.totalPages
        ? currentPage + OFFSET
        : reviewsResponse!.totalPages;
    const pageNos = Array.from(
      { length: right - left + 1 },
      (_, index) => left + index
    );
    return (
      <div className="flex flex-row">
        {left > 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {pageNos.map((pageNo) => (
          <PaginationItem key={pageNo}>
            <PaginationLink
              isActive={currentPage == pageNo}
              className="cursor-pointer"
              onClick={() => setCurrentPage(pageNo)}
            >
              {pageNo}
            </PaginationLink>
          </PaginationItem>
        ))}
        {right < reviewsResponse!.totalPages && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
      </div>
    );
  };

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
          {reviewsResponse!.reviews ? (
            reviewsResponse!.reviews.map((review) => (
              <div key={review.id + review.userId}>
                <Review review={review} key={review.id} />
                <Separator key={review.createdAt} className="mt-2" />
              </div>
            ))
          ) : (
            <h2 className="text-lg">No reviews found</h2>
          )}
          {reviewsResponse!.reviews && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    aria-disabled={currentPage <= 1}
                    tabIndex={currentPage <= 1 ? -1 : undefined}
                    className={
                      currentPage <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                    onClick={() =>
                      currentPage > 1 ? setCurrentPage(currentPage - 1) : ""
                    }
                  />
                </PaginationItem>
                {renderPages()}
                <PaginationItem>
                  <PaginationNext
                    aria-disabled={currentPage >= reviewsResponse!.totalPages}
                    tabIndex={
                      currentPage >= reviewsResponse!.totalPages
                        ? -1
                        : undefined
                    }
                    className={
                      currentPage >= reviewsResponse!.totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                    onClick={() =>
                      currentPage < reviewsResponse!.totalPages
                        ? setCurrentPage(currentPage + 1)
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
};

export default Reviews;
