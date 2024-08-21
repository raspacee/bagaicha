import { Link } from "react-router-dom";
import { DateTime } from "luxon";
import { copyToClipboard, haversine } from "../../lib/helpers";
import { useAppSelector, useAppDispatch } from "../../hooks";
import { setImgModal } from "../../slice/modalSlice";
import {
  Bookmark,
  Copy,
  Dot,
  Ellipsis,
  Heart,
  MapPinHouse,
  Pencil,
  Trash2,
} from "lucide-react";
import PostOpened from "./PostOpened";
import { FeedPost } from "@/lib/types";
import {
  useBookmarkPost,
  useLikePost,
  useUnbookmarkPost,
  useUnlikePost,
} from "@/api/PostApi";
import EditPostDialog from "./EditPostDialog";
import { Rating } from "@mui/material";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";
import DeletePostDialog from "./DeletePostDialog";
import { useGetMyUserData } from "@/api/UserApi";
import { Separator } from "../ui/separator";

type Props = {
  post: FeedPost;
  renderedFromFeed?: boolean;
};

export default function Post({ post, renderedFromFeed }: Props) {
  const location = useAppSelector((state) => state.location);
  const dispatch = useAppDispatch();
  const isLocationGranted = location.lat != -1 && location.long != -1;

  const { myUser } = useGetMyUserData();

  const { likePost } = useLikePost(renderedFromFeed);
  const { unlikePost } = useUnlikePost(renderedFromFeed);
  const { bookmarkPost } = useBookmarkPost(renderedFromFeed);
  const { unbookmarkPost } = useUnbookmarkPost(renderedFromFeed);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const date = DateTime.fromISO(post.createdAt);

  const img = new Image();
  img.src = post.imageUrl;

  return (
    <div className="bg-white w-full h-fit px-1 md:px-6 py-3 mb-3">
      <div className="flex flex-col md:flex-row justify-between md:items-center">
        <div className="flex items-center">
          <img
            src={post.authorPictureUrl}
            alt="User profile picture"
            className="rounded-full h-11 w-11 object-cover"
            width="100"
            height="100"
          />
          <Link to={`/user/${post.authorId}`}>
            <p className="ml-2">
              {post.authorFirstName + " " + post.authorLastName}
            </p>
          </Link>
        </div>
        <div className="flex gap-1 px-1 mt-1 md:mt-0">
          <span className="font-normal text-sm text-muted-foreground">
            {date.toRelative()}
          </span>
          <Dot size={25} />
          <div className="flex">
            <Rating value={post.rating} readOnly />
          </div>
          <div className="flex ml-2 md:ml-4 flex-1 justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Ellipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {myUser && myUser.id == post.authorId && (
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onSelect={() => setIsEditDialogOpen(true)}
                    >
                      <Pencil size={20} className="mr-2" />
                      <span>Edit Post</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setIsDeleteDialogOpen(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 size={20} className="mr-2" />
                      <span>Delete Post</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </DropdownMenuGroup>
                )}
                <DropdownMenuItem onClick={() => copyToClipboard(post.id)}>
                  <Copy size={20} className="mr-2" />
                  <span>Copy ID</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
              <EditPostDialog
                postId={post.id}
                open={isEditDialogOpen}
                setOpen={setIsEditDialogOpen}
              />
              <DeletePostDialog
                postId={post.id}
                open={isDeleteDialogOpen}
                setOpen={setIsDeleteDialogOpen}
              />
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="mt-2 pt-1 flex md:items-center flex-col md:flex-row gap-3">
        <Link to={`/place/${post.placeId}`}>
          at <span className="font-semibold">{post.placeName}</span>
        </Link>
        {isLocationGranted && (
          <div className="flex">
            <Dot className="hidden md:block" size={25} />
            <MapPinHouse className="block md:hidden" />
            <span className="ml-0.5 text-sm font-normal text-gray-500">{`${haversine(
              location.lat,
              location.long,
              post.lat,
              post.lon
            )} km away from you`}</span>
          </div>
        )}
      </div>
      <div className="mt-2 md:w-[500px]">
        <img
          src={`${img.src}`}
          alt="Food picture"
          onClick={() =>
            dispatch(
              setImgModal({
                value: true,
                src: post.imageUrl,
              })
            )
          }
          className="rounded-md cursor-pointer w-full aspect-video object-cover"
        />
      </div>
      <div className="my-3">
        <p>{post.body}</p>
      </div>
      <div className="flex items-center gap-3">
        {post.hasLiked ? (
          <Heart
            size={25}
            color="red"
            fill="red"
            onClick={() => unlikePost(post.id)}
            cursor="pointer"
          />
        ) : (
          <Heart cursor="pointer" size={25} onClick={() => likePost(post.id)} />
        )}
        <PostOpened postId={post.id as string} />
        {post.hasBookmarked ? (
          <Bookmark
            size={25}
            color="black"
            fill="black"
            cursor="pointer"
            onClick={() => unbookmarkPost(post.id)}
          />
        ) : (
          <Bookmark
            size={25}
            onClick={() => bookmarkPost(post.id)}
            cursor="pointer"
          />
        )}
      </div>
      <div>
        {post.likeCount != 0 && (
          <span className="text-sm mt-2 font-medium text-muted-foreground select-none">
            {`${post.likeCount} people love this post`}
          </span>
        )}
      </div>
      <Separator className="mt-5" />
    </div>
  );
}
