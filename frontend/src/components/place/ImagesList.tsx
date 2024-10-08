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
import { PlaceImage, User } from "@/lib/types";
import { Loader2Icon } from "lucide-react";
import { DateTime } from "luxon";
import { Button } from "../ui/button";

type Props = {
  placeId: string;
};

type ImageDescriptionProps = {
  image: PlaceImage;
  myUser: User;
  fetchImages: () => void;
};

const ImageDescription = ({
  image,
  myUser,
  fetchImages,
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
    <div className="h-full col-span-4 px-8 py-10">
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

const ImagesList = ({ placeId }: Props) => {
  const {
    placeImages,
    fetchImages,
    isLoading: isImagesLoading,
  } = useGetPlaceImages(placeId as string);
  const { myUser } = useGetMyUserData();

  return (
    <Dialog>
      <DialogTrigger
        onClick={() => fetchImages()}
        className="mt-4 border bg-transparent text-white font-semibold py-2 px-5 rounded-md bg-opacity-80 w-fit"
      >
        Show All Photos
      </DialogTrigger>
      <DialogContent className="max-w-full md:max-w-[80%] max-h-screen overflow-y-scroll">
        <DialogHeader>
          <Input placeholder="Search photos" className="w-[80%] md:w-[35%]" />
        </DialogHeader>
        <div className="min-h-[14rem] md:min-h-[20rem]">
          <div className="grid gap-2 grid-cols-2 md:grid-cols-5">
            {isImagesLoading && <h2>Photos are loading</h2>}
            {!isImagesLoading &&
              placeImages &&
              placeImages.map((image) => (
                <Dialog key={image.id}>
                  <DialogTrigger>
                    <div className="overflow-hidden aspect-square hover:rounded-md hover:shadow-2xl">
                      <img
                        src={image.imageUrl}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-full md:max-w-[80%] p-0 border-black">
                    <DialogTitle className="hidden">
                      <VisuallyHidden.Root>
                        Image Information
                      </VisuallyHidden.Root>
                    </DialogTitle>
                    <div className="relative h-[90vh] w-full grid md:grid-cols-12">
                      <img
                        src={image.imageUrl}
                        className="w-full h-full object-contain col-span-8 bg-black"
                      />
                      {myUser && (
                        <ImageDescription
                          image={image}
                          myUser={myUser}
                          fetchImages={fetchImages}
                        />
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
      </DialogContent>
    </Dialog>
  );
};

export default ImagesList;
