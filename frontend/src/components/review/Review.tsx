import { FetchedPlaceReviewWithAuthor } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DateTime } from "luxon";
import { AspectRatio } from "../ui/aspect-ratio";
import { Link } from "react-router-dom";
import { Rating } from "@mui/material";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";

type Props = {
  review: FetchedPlaceReviewWithAuthor;
};

const Review = ({ review }: Props) => {
  const author = review.author;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 items-center">
        <Avatar>
          <AvatarImage src={author.profilePictureUrl} />
          <AvatarFallback>{`${author.firstName.charAt(
            0
          )}${author.lastName.charAt(0)}`}</AvatarFallback>
        </Avatar>
        <div className="flex flex-row justify-between w-full md:w-[50%]">
          <div>
            <Link to={`/user/${author.id}`}>
              <h2 className="font-bold">{`${author.firstName} ${author.lastName}`}</h2>
            </Link>
            <p className="text-sm text-muted-foreground">
              {DateTime.fromISO(review.createdAt).toRelative()}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Report</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div>
        <Rating value={review.rating} readOnly />
        <p>{review.body}</p>
        {review.imageUrl && (
          <AspectRatio ratio={16 / 9}>
            <img src={review.imageUrl} className="h-full object-contain mt-1" />
          </AspectRatio>
        )}
      </div>
    </div>
  );
};

export default Review;
