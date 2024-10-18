import { useDeleteImage, useGetPlaceImages } from "@/api/PlaceApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link } from "react-router-dom";
import { useGetMyUserData, useGetUserData } from "@/api/UserApi";
import { PlaceImage, FetchedUser } from "@/lib/types";
import { ChevronLeft, ChevronRight, Loader2Icon, X } from "lucide-react";
import { DateTime } from "luxon";
import { Button } from "../ui/button";
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";

type Props = {
  placeId: string;
};

const ImagesList = ({ placeId }: Props) => {
  const [filterQuery, setFilterQuery] = useState("");
  const {
    placeImages,
    fetchImages,
    isLoading: isImagesLoading,
  } = useGetPlaceImages(placeId as string, filterQuery);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const { myUser } = useGetMyUserData();
  const [openImgDialog, setOpenImgDialog] = useState(false);

  const debounced = useDebouncedCallback(
    (query: string) => setFilterQuery(query),
    400
  );

  const onPrev = () => {
    if (activeImageIdx > 1) setActiveImageIdx(activeImageIdx - 1);
  };

  const onNext = () => {
    if (placeImages && activeImageIdx < placeImages.length - 1)
      setActiveImageIdx(activeImageIdx + 1);
  };

  return (
    <Dialog>
      <DialogTrigger
        onClick={() => fetchImages()}
        className="mt-4 border bg-transparent text-white font-semibold py-2 px-5 rounded-md bg-opacity-80 w-fit"
      >
        Show All Photos
      </DialogTrigger>
      <DialogContent className="max-w-full md:max-w-[80%] max-h-screen lg:max-w-screen-lg overflow-y-scroll min-h-screen flex flex-col">
        <DialogTitle className="hidden">
          <VisuallyHidden.Root>Image Information</VisuallyHidden.Root>
        </DialogTitle>
        <DialogHeader>
          <Input
            placeholder="Search photos"
            className="w-[80%] md:w-[35%]"
            defaultValue=""
            onChange={(e) => debounced(e.target.value)}
            autoFocus={false}
          />
        </DialogHeader>
        <div className="">
          <div className="grid gap-2 grid-cols-2 md:grid-cols-5">
            {isImagesLoading && <h2>Photos are loading</h2>}
            {!isImagesLoading &&
              placeImages &&
              placeImages.map((image, index) => (
                <Dialog
                  key={image.id}
                  open={openImgDialog}
                  onOpenChange={setOpenImgDialog}
                >
                  <DialogTrigger onClick={() => setActiveImageIdx(index)}>
                    <div className="overflow-hidden aspect-square hover:rounded-md hover:shadow-2xl">
                      <img
                        src={image.imageUrl}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-full md:mx-w-[80%] p-0 border-black min-h-screen md:min-h-fit [&>button]:hidden">
                    <DialogTitle className="hidden">
                      <VisuallyHidden.Root>
                        Image Information
                      </VisuallyHidden.Root>
                    </DialogTitle>
                    <div className="relative h-[90vh] w-full grid md:grid-cols-12">
                      <Button
                        className="absolute -translate-x-1 translate-y-1 top-0 right-0 bg-gray-400 bg-opacity-60 text-white font-semibold drop-shadow-md cursor-pointer"
                        variant="ghost"
                        onClick={() => setOpenImgDialog(false)}
                      >
                        Close
                      </Button>
                      <img
                        src={placeImages[activeImageIdx].imageUrl}
                        className="w-full h-full object-contain col-span-8 bg-black"
                      />
                      {myUser && (
                        <ImageDescription
                          image={placeImages[activeImageIdx]}
                          myUser={myUser}
                          fetchImages={fetchImages}
                          onPrev={onPrev}
                          onNext={onNext}
                        />
                      )}
                      {activeImageIdx > 1 && (
                        <button
                          onClick={onPrev}
                          className={`absolute top-1/2 left-0 -translate-y-1/2 bg-gray-500 h-10 w-10 flex items-center justify-center rounded-full bg-opacity-60 translate-x-2`}
                        >
                          <ChevronLeft size={30} />
                        </button>
                      )}
                      {activeImageIdx < placeImages.length - 1 && (
                        <button
                          onClick={onNext}
                          className={`absolute top-1/2 right-0 -translate-y-1/2 bg-gray-500 h-10 w-10 flex items-center justify-center rounded-full bg-opacity-60 -translate-x-2`}
                        >
                          <ChevronRight size={30} />
                        </button>
                      )}
                    </div>
                    <DialogDescription className="hidden">
                      <VisuallyHidden.Root>
                        Description goes here
                      </VisuallyHidden.Root>
                    </DialogDescription>
                  </DialogContent>
                </Dialog>
              ))}
            {!isImagesLoading && !placeImages && (
              <h2 className="font-bold text-xl">No photos found</h2>
            )}
          </div>
        </div>
        <DialogDescription className="hidden">
          <VisuallyHidden.Root>Description goes here</VisuallyHidden.Root>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

type ImageDescriptionProps = {
  image: PlaceImage;
  myUser: FetchedUser;
  fetchImages: () => void;
  onPrev: () => void;
  onNext: () => void;
};

const ImageDescription = ({
  image,
  myUser,
  fetchImages,
  onNext,
  onPrev,
}: ImageDescriptionProps) => {
  const { isLoading, user: author } = useGetUserData(image.addedBy);
  const { deleteImage, isPending: isDeleting } = useDeleteImage(
    image.cloudinaryId,
    fetchImages
  );

  if (!author) {
    return <h2>Author ID not found</h2>;
  }

  return (
    <div className="h-full col-span-4 px-8 py-10 relative">
      {isLoading ? (
        <span className="flex gap-2">
          <Loader2Icon className="animate-spin" /> <p>Loading</p>
        </span>
      ) : (
        <>
          <span className="flex gap-2 items-center">
            <Avatar>
              <AvatarImage src={author?.profilePictureUrl} />
              <AvatarFallback>{image.addedBy}</AvatarFallback>
            </Avatar>
            <div>
              <Link to={`/user/${image.addedBy}`}>
                <h2 className="font-semibold hover:text-blue-700">
                  {`${author?.firstName} ${author?.lastName}`}{" "}
                  {myUser.id === author.id && "(You)"}
                </h2>
              </Link>
              <p className="text-sm text-muted-foreground">
                {DateTime.fromISO(image.createdAt).toFormat("MMM dd, yyyy")}
              </p>
            </div>
          </span>
          <p className="mt-4 px-1">{image.description}</p>
          {myUser.id == author.id && (
            <Button
              variant="link"
              className="px-0 mt-8 text-red-600"
              disabled={isDeleting}
              onClick={() => deleteImage()}
            >
              Delete this photo
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default ImagesList;
