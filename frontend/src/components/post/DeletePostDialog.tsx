import { useDeleteMyPost } from "@/api/PostApi";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type Props = {
  postId: string;
  open: boolean;
  setOpen: (state: boolean) => void;
};

const DeletePostDialog = ({ postId, open, setOpen }: Props) => {
  const { deletePost, isPending } = useDeleteMyPost();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="h-[8rem]">
          <DialogTitle>Delete Post</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your post?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            className="bg-red-600"
            disabled={isPending}
            onClick={() => deletePost(postId)}
          >
            Delete Post
          </Button>
          <Button>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePostDialog;
