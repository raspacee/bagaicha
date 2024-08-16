import { editPostFormSchema, FeedPost, EditPostForm } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Rating } from "@mui/material";
import { Button } from "../ui/button";
import { useUpdateMyPost } from "@/api/PostApi";

type Props = {
  post: FeedPost;
  onSave: () => void;
};

const UpdatePostForm = ({ post, onSave }: Props) => {
  const { isPending, updateMyPost } = useUpdateMyPost(post.id);
  const form = useForm<EditPostForm>({
    resolver: zodResolver(editPostFormSchema),
    defaultValues: {
      body: post?.body,
      rating: post?.rating,
    },
  });

  const onSubmit = (formDataJson: EditPostForm) => {
    updateMyPost(formDataJson);
    onSave();
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Body</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Post Body"
                  className="h-[8rem]"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Food Rating</FormLabel>
              <FormControl>
                <Rating
                  value={field.value}
                  onChange={(e, value) => field.onChange(value)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button className="mt-3" type="submit" disabled={isPending}>
          Save
        </Button>
      </form>
    </Form>
  );
};

export default UpdatePostForm;
