import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AspectRatio } from "../ui/aspect-ratio";
import { MessageCircle, Send } from "lucide-react";
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
      <DialogContent className="min-w-full md:min-w-[60vw] h-[90vh] md:h-screen px-1 md:px-4 py-3 flex flex-col gap-2">
        {(enabled && isPostLoading) || !post ? (
          <h1>Loading...</h1>
        ) : (
          <ScrollArea className="w-full min-h-[90%]">
            <div className="hidden md:block">
              <div className="w-full roudned-md">
                <img
                  className="object-cover shadow-md aspect-video w-full rounded-md mt-5"
                  src={post.imageUrl}
                />
              </div>
            </div>
            <div className="hidden md:flex md:flex-col md:gap-4 mt-2">
              <div className="flex items-center gap-2">
                <img
                  src={post.authorPictureUrl}
                  style={{ width: "40px", height: "40px" }}
                  className="rounded-full object-cover"
                />
                <Link to={`/user/${post.authorEmail}`}>
                  {post.authorFirstName + " " + post.authorLastName}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm">
                  {DateTime.fromISO(post.createdAt).toRelative()}
                </p>
                <Rating
                  name="half-rating-read"
                  value={post.rating}
                  precision={0.5}
                  readOnly
                />
              </div>
              <p>{post.placeName}</p>
              <p className="font-medium text-gray-600">
                {`${haversine(
                  location.lat,
                  location.long,
                  post.lat,
                  post.lon
                )} km away from you`}
              </p>
              <Separator />
            </div>
            <h1 className="block font-bold text-2xl">Comments</h1>
            <div className="h-fit bg-white w-full my-3">
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
                      <p>
                        {comment.authorFirstName + " " + comment.authorLastName}
                      </p>
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
