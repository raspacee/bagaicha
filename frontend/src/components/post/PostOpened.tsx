import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MapPinHouse, MessageCircle, Navigation, Send } from "lucide-react";
import { useCreateComment, useFetchPostById } from "@/api/PostApi";
import { Link } from "react-router-dom";
import { Rating } from "@mui/material";
import { DateTime } from "luxon";
import { useAppSelector } from "@/hooks";
import { haversine } from "@/lib/helpers";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "../ui/scroll-area";
import { useEffect } from "react";
import { CommentForm, commentFormSchema } from "@/lib/types";

type Props = { postId: string };

const PostOpened = ({ postId }: Props) => {
  const location = useAppSelector((state) => state.location);
  const queryClient = useQueryClient();

  const {
    post,
    isLoading: isPostLoading,
    setEnabled,
    enabled,
  } = useFetchPostById(postId);

  const {
    createComment,
    isPending: isCommentPending,
    isSuccess,
  } = useCreateComment();

  const form = useForm<CommentForm>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      postId: postId,
      body: "",
    },
  });

  const onSubmit = (formData: CommentForm) => {
    createComment(formData);
  };

  useEffect(() => {
    if (isSuccess) {
      form.setValue("body", "");
      queryClient.invalidateQueries({ queryKey: ["posts", postId] });
    }
  }, [isSuccess]);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) setEnabled(true);
        else {
          setEnabled(false);
          form.clearErrors();
        }
      }}
    >
      <DialogTrigger asChild>
        <MessageCircle size={25} />
      </DialogTrigger>
      <DialogContent className="min-w-full md:min-w-[60vw] h-[90vh] md:h-screen p-0 border-none flex flex-col gap-2">
        {(enabled && isPostLoading) || !post ? (
          <h1>Loading...</h1>
        ) : (
          <ScrollArea className="w-full min-h-[90%]">
            <div className="hidden md:block w-full">
              <img
                className="object-contain w-full aspect-video rounded-md my-2"
                src={post.imageUrl}
              />
            </div>
            <div className="md:flex md:flex-col gap-[0.5rem] my-2 px-3">
              <div className="flex items-center gap-2">
                <img
                  src={post.authorPictureUrl}
                  style={{ width: "45px", height: "45px" }}
                  className="rounded-full object-cover"
                />
                <div>
                  <Link
                    to={`/user/${post.authorEmail}`}
                    className="font-semibold flex flex-col md:flex-row items-center md:gap-3"
                  >
                    {post.authorFirstName + " " + post.authorLastName}
                    <span className="font-thin hidden md:block">|</span>
                    <Rating
                      name="half-rating-read"
                      value={post.rating}
                      precision={0.5}
                      readOnly
                    />
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {DateTime.fromISO(post.createdAt).toRelative()}
                  </p>
                </div>
              </div>
              <span className="flex gap-2 items-center">
                <MapPinHouse size={26} className="text-blue-600" />
                <Link to={`/place/${post.placeId}`} className="font-bold">
                  {post.placeName}
                </Link>
              </span>
              <span className="flex gap-2 items-center">
                <Navigation size={26} className="text-green-700" />
                <p className="font-medium">
                  {`${haversine(
                    location.lat,
                    location.long,
                    post.lat,
                    post.lon
                  )} km away from you`}
                </p>
              </span>
            </div>
            <div className="px-3 my-5">
              <p>{post.body}</p>
            </div>
            <Separator />
            <h1 className="block font-bold text-2xl px-3">Comments</h1>
            <div className="h-fit bg-white w-full my-3 px-3">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex items-center gap-2 md:px-6"
                >
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="Comment something"
                            {...field}
                            className={`${
                              form.formState.errors.body && "border-red-500"
                            }`}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    variant="outline"
                    className="rounded-full"
                    type="submit"
                    disabled={isCommentPending}
                  >
                    <Send />
                  </Button>
                </form>
              </Form>
            </div>
            <div>
              {post.comments.length == 0 ? (
                <div>
                  <h1>No comments</h1>
                </div>
              ) : (
                post.comments.map((comment) => (
                  <div className="flex flex-col gap-2 px-1 md:px-4 mt-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={comment.authorPictureUrl}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <Link
                          to={`/user/${comment.authorId}`}
                          className="font-medium"
                        >
                          {comment.authorFirstName +
                            " " +
                            comment.authorLastName}
                        </Link>
                        <p className="text-xs font-medium text-muted-foreground">
                          {DateTime.fromISO(post.createdAt).toRelative()}
                        </p>
                      </div>
                    </div>
                    <div className="">{comment.body}</div>
                    <Separator />
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PostOpened;
