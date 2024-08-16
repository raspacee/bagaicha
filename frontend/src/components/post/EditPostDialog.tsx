import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { useEffect } from "react";
import { useFetchPostById } from "@/api/PostApi";
import EditPostForm from "../forms/UpdatePostForm";

type Props = {
  postId: string;
  open: boolean;
  setOpen: (state: boolean) => void;
};

const EditPostDialog = ({ postId, open, setOpen }: Props) => {
  const { post, isLoading, setEnabled } = useFetchPostById(postId);

  useEffect(() => {
    if (open) {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isLoading && post && (
        <DialogContent className="h-full md:h-auto w-full md:w-[80%] flex flex-col gap-10 justify-start">
          <DialogTitle>Edit Post</DialogTitle>
          <EditPostForm post={post} onSave={() => setOpen(false)} />
        </DialogContent>
      )}
    </Dialog>
  );
};

export default EditPostDialog;
