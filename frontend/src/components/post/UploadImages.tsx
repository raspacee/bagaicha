import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Camera, Upload } from "lucide-react";
import DragAndDrop from "./DragAndDrop";
import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useUploadPlaceImages } from "@/api/PlaceApi";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

type Props = {
  placeId: string;
};

const UploadImages = ({ placeId }: Props) => {
  const { isPending, uploadImages } = useUploadPlaceImages(placeId);

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleSubmit = () => {
    const form = new FormData();
    images.map((image) => form.append("images[]", image));
    form.append("description", description);
    uploadImages(form);
    clearFields();
  };

  const clearFields = () => {
    setImages([]);
    setPreviews([]);
    setDescription("");
  };

  return (
    <Dialog>
      <DialogTrigger
        type="button"
        className="flex px-4 py-2 rounded-md bg-transparent border text-white font-semibold gap-2 hover:bg-transparent"
      >
        <Camera />
        Add Photo
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="hidden">
          <VisuallyHidden.Root>
            Upload image from this component
          </VisuallyHidden.Root>
        </DialogTitle>
        <DialogHeader>
          <h2 className="font-bold text-lg">Upload photo(s) of this place</h2>
        </DialogHeader>
        <div>
          <DragAndDrop handleChange={handleChange} />
          <Label className="gap-2">
            Please describe the photos
            <Input
              placeholder="Type here"
              onChange={(e) => setDescription(e.target.value)}
            />
          </Label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 bg-red-50 my-2">
            {previews.map((previewURL) => (
              <div className="overflow-hidden aspect-square">
                <img src={previewURL} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <Button
            className="mt-5 gap-2"
            onClick={handleSubmit}
            disabled={images.length == 0 || isPending}
          >
            <Upload /> Upload
          </Button>
        </div>
        <DialogDescription className="hidden">
          <VisuallyHidden.Root>Description goes here</VisuallyHidden.Root>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default UploadImages;
