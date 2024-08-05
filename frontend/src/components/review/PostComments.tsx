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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "../ui/scroll-area";

const commentSchema = z.object({
  postId: z.string().min(1),
  commentBody: z.string().min(1).max(500),
});

export type CommentForm = z.infer<typeof commentSchema>;

type Props = { postId: string };

const PostComments = ({ postId }: Props) => {
  const location = useAppSelector((state) => state.location);
  const {
    post,
    isLoading: isPostLoading,
    setEnabled,
    enabled,
  } = useFetchPostById(postId);
  const queryClient = useQueryClient();
  const {
    createComment,
    isPending: isCommentPending,
    isSuccess,
  } = useCreateComment();
  const form = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      commentBody: "",
      postId: postId,
    },
  });

  const onSubmit = (formData: CommentForm) => {
    createComment(formData);
  };

  if (isSuccess) {
    form.setValue("commentBody", "");
    queryClient.invalidateQueries({ queryKey: ["post", postId] });
  }

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
      <DialogTrigger>
        <MessageCircle size={25} />
      </DialogTrigger>
      <DialogContent className="h-screen min-w-full md:min-w-[60vw] md:h-[90vh] px-1 md:px-4 py-3 flex flex-col gap-2">
        {(enabled && isPostLoading) || !post ? (
          <h1>Loading...</h1>
        ) : (
          <>
            <ScrollArea className="w-full">
              <div className="hidden md:block">
                <div className="w-full">
                  <AspectRatio ratio={16 / 9}>
                    <img className="object-cover" src={post.picture} />
                  </AspectRatio>
                </div>
              </div>
              <div className="hidden md:flex md:flex-col md:gap-4">
                <div className="flex items-center gap-2">
                  <img
                    src={post.author_profile_picture_url}
                    style={{ width: "40px", height: "40px" }}
                    className="rounded-full object-cover"
                  />
                  <Link to={`/user/${post.author_email}`}>
                    {post.author_name}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm">
                    {DateTime.fromISO(post.created_at).toRelative()}
                  </p>
                  <Rating
                    name="half-rating-read"
                    value={post.rating}
                    precision={0.5}
                    readOnly
                  />
                </div>
                <p>{post.place_name}</p>
                <p className="font-medium text-gray-600">
                  {`${haversine(
                    location.lat,
                    location.long,
                    post.place_lat,
                    post.place_long
                  )} km away from you`}
                </p>
                <Separator />
              </div>
              <h1 className="block font-bold text-2xl">Comments</h1>
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
                          src={comment.author_picture_url}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <p>{comment.author_name}</p>
                      </div>
                      <div className="">{comment.body}</div>
                      <Separator />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="h-[4rem] bottom-0 sticky bg-white w-full">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex items-center gap-2 md:px-6"
                >
                  <FormField
                    control={form.control}
                    name="commentBody"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="Comment something"
                            {...field}
                            className={`${
                              form.formState.errors.commentBody &&
                              "border-red-500"
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
          </>
        )}
      </DialogContent>
    </Dialog>
    // <Dialog
    //   onOpenChange={(open) => {
    //     if (open) setEnabled(true);
    //     else {
    //       setEnabled(false);
    //       form.clearErrors();
    //     }
    //   }}
    // >
    //   <DialogTrigger>
    //     <MessageCircle size={25} />
    //   </DialogTrigger>
    //   <DialogContent className="min-w-full md:min-w-[80%] h-full md:h-[80%]">
    //     {(enabled && isPostLoading) || !post ? (
    //       <div>
    //         <h1>Loading...</h1>
    //       </div>
    //     ) : (
    //       <div className="flex gap-1">
    //         <div className="hidden md:block md:min-w-[70%] md:h-full">
    //           <AspectRatio ratio={16 / 9}>
    //             <img className="object-cover" src={post.picture} />
    //           </AspectRatio>
    //         </div>
    //         <div className="flex flex-1 flex-col gap-2 px-2 h-[96%]">
    //           <h1 className="font-bold text-2xl block md:hidden">Comments</h1>
    //           <div className="hidden md:block">
    //             <div className="flex items-center gap-2">
    //               <img
    //                 src={post.author_profile_picture_url}
    //                 style={{ width: "40px", height: "40px" }}
    //                 className="rounded-full object-cover"
    //               />
    //               <Link to={`/user/${post.author_email}`}>
    //                 {post.author_name}
    //               </Link>
    //             </div>
    //             <div className="flex items-center gap-2">
    //               <p className="text-sm">
    //                 {DateTime.fromISO(post.created_at).toRelative()}
    //               </p>
    //               <Rating
    //                 name="half-rating-read"
    //                 value={post.rating}
    //                 precision={0.5}
    //                 readOnly
    //               />
    //             </div>
    //             <p>{post.place_name}</p>
    //             <p className="font-medium text-gray-600">
    //               {`${haversine(
    //                 location.lat,
    //                 location.long,
    //                 post.place_lat,
    //                 post.place_long
    //               )} km away from you`}
    //             </p>
    //             <Separator />
    //           </div>
    //           <ScrollArea className="flex-1 h-[70%]">
    //             {post.comments.length == 0 ? (
    //               <div>
    //                 <h1>No comments</h1>
    //               </div>
    //             ) : (
    //               post.comments.map((comment) => (
    //                 <div className="flex flex-col gap-2 px-1 mt-2">
    //                   <div className="flex items-center gap-2">
    //                     <img
    //                       src={comment.author_picture_url}
    //                       className="w-10 h-10 rounded-full object-cover"
    //                     />
    //                     <p>{comment.author_name}</p>
    //                   </div>
    //                   <div className="">{comment.body}</div>
    //                   <Separator />
    //                 </div>
    //               ))
    //             )}
    //           </ScrollArea>
    //           <Form {...form}>
    //             <form
    //               onSubmit={form.handleSubmit(onSubmit)}
    //               className="flex items-center gap-2"
    //             >
    //               <FormField
    //                 control={form.control}
    //                 name="commentBody"
    //                 render={({ field }) => (
    //                   <FormItem>
    //                     <FormControl>
    //                       <Input
    //                         placeholder="Comment something"
    //                         {...field}
    //                         className={`${
    //                           form.formState.errors.commentBody &&
    //                           "border-red-500"
    //                         }`}
    //                       />
    //                     </FormControl>
    //                   </FormItem>
    //                 )}
    //               />
    //               <Button
    //                 variant="outline"
    //                 className="rounded-full"
    //                 type="submit"
    //                 disabled={isCommentPending}
    //               >
    //                 <Send />
    //               </Button>
    //             </form>
    //           </Form>
    //         </div>
    //       </div>
    //     )}
    //   </DialogContent>
    // </Dialog>
  );
};

export default PostComments;
