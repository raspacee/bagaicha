import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  useDeletePlaceMenuImage,
  useGetPlaceMenus,
  useUploadPlaceMenuImages,
} from "@/api/PlaceApi";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "../ui/button";
import { useState } from "react";
import { useGetMyUserData } from "@/api/UserApi";
import { USER_LEVELS } from "@/lib/config";

type Props = {
  placeId: string;
};

const PlaceMenu = ({ placeId }: Props) => {
  const { menuImages, isLoading: isImagesLoading } = useGetPlaceMenus(placeId);
  const [images, setImages] = useState<File[] | null>(null);
  const { myUser } = useGetMyUserData();

  const cleanUpCallback = () => {
    setImages(null);
  };

  const { isPending: isUploading, uploadMenuImages } = useUploadPlaceMenuImages(
    placeId,
    cleanUpCallback
  );
  const { isPending: isDeleting, deleteMenuImage } =
    useDeletePlaceMenuImage(placeId);

  const handleUpload = () => {
    if (images) {
      const formData = new FormData();
      for (let i = 0; i < images.length; i++) {
        formData.append("images[]", images[i]);
      }
      uploadMenuImages(formData);
    }
  };

  return (
    <div className="min-h-[14rem] md:min-h-[20rem] max-h-[18rem] overflow-y-scroll">
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        {isImagesLoading && <h2>Photos are loading</h2>}

        {!isImagesLoading &&
          menuImages &&
          menuImages.map((image) => (
            <Dialog key={image.id}>
              <DialogTrigger>
                <div className="overflow-hidden aspect-square hover:rounded-md hover:shadow-2xl">
                  <img
                    src={image.imageUrl}
                    className="w-full h-full object-cover"
                  />
                </div>
              </DialogTrigger>
              <DialogContent
                CustomClose={<X className="w-5 h-5 text-white" />}
                className="max-w-full md:max-w-[80%] p-0 border-none bg-transparent"
              >
                <DialogTitle className="hidden">
                  <VisuallyHidden.Root>Image Information</VisuallyHidden.Root>
                </DialogTitle>
                <Carousel
                  opts={{ loop: true }}
                  className="bg-transparent border-none shadow-none"
                >
                  <CarouselContent>
                    {menuImages
                      .slice(menuImages.indexOf(image))
                      .map((image) => (
                        <CarouselItem
                          key={image.id}
                          className="w-[80%] h-[90vh]"
                        >
                          <img
                            src={image.imageUrl}
                            className="h-full w-full object-contain"
                          />
                        </CarouselItem>
                      ))}
                    {menuImages
                      .slice(0, menuImages.indexOf(image))
                      .map((image) => (
                        <CarouselItem
                          key={image.id}
                          className="w-[80%] h-[90vh]"
                        >
                          <img
                            src={image.imageUrl}
                            className="h-full w-full object-contain"
                          />
                        </CarouselItem>
                      ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                  {myUser?.moderationLvl == 2 && (
                    <div className="flex w-full items-center justify-center py-1">
                      <Button
                        className="border border-red-600 text-red-600"
                        variant="ghost"
                        disabled={isDeleting}
                        onClick={() => deleteMenuImage(image.cloudinaryId)}
                      >
                        Delete Photo
                      </Button>
                    </div>
                  )}
                </Carousel>
                <DialogDescription className="hidden">
                  <VisuallyHidden.Root>
                    Description goes here
                  </VisuallyHidden.Root>
                </DialogDescription>
              </DialogContent>
            </Dialog>
          ))}
      </div>
      {!isImagesLoading && !menuImages && (
        <h2 className="font-bold text-xl">No menu photos found</h2>
      )}
    </div>
  );
};

export default PlaceMenu;
