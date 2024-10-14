import { Request, Response, NextFunction } from "express";
import PlaceModel from "../models/place.model";
import PlaceReview from "../models/placeReviewModel";
import UserModel from "../models/user.model";
import OwnershipRequestModel from "../models/ownershipRequest.model";
import PlaceImageModel from "../models/placeImage.model";
import OperatingHourModel from "../models/operatingHour.model";
import { uploadImage } from "../utils/image";
import {
  AddPlaceForm,
  Distance,
  EditPlaceForm,
  FoodsOffered,
  OperatingHourForm,
  operatingHourSchema,
  OwnershipRequestForm,
  PlaceFeature,
  UserLocation,
} from "../types";
import { DAYS, DB_CODES } from "../utils/config";

const getPlace = async (req: Request, res: Response, next: NextFunction) => {
  const placeId = req.params.placeId as string;
  try {
    const place = await PlaceModel.getPlacebyId(placeId);
    if (!place) {
      return res.status(404).json({
        message: "Place not found",
      });
    }
    return res.status(200).json(place);
  } catch (err) {
    return res.status(500).send({
      message: "Error while getting place data",
    });
  }
};

const get_review = async (req: Request, res: Response, next: NextFunction) => {
  const place_id = req.params.place_id;
  const rating = req.params.rating;

  try {
    const reviews = await PlaceModel.get_review_by_rating(place_id, rating);
    if (reviews == null) {
      return res
        .status(200)
        .send({ status: "error", message: "Reviews not found" });
    }
    return res.status(200).send({
      status: "ok",
      reviews: reviews,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      error: err,
    });
  }
};

export const place_features = [
  { key: "delivery", value: 0 },
  { key: "takeout", value: 1 },
  { key: "pet_friendly", value: 2 },
  { key: "very_clean", value: 3 },
  { key: "affordable", value: 4 },
];

const getMyTopPlaces = async (req: Request, res: Response) => {
  try {
    const features = req.query.selectedFeatures as string;
    const selectedFeatures =
      features !== "" ? (features?.split(",") as PlaceFeature[]) : null;
    const foods = req.query.selectedFoods as string;
    const selectedFoods =
      foods !== "" ? (foods?.split(",") as FoodsOffered[]) : null;
    const selectedDistance: Distance = JSON.parse(
      req.query.selectedDistance as string
    );
    const userCoordinates: UserLocation = {
      lat: parseInt(req.query.lat as string),
      lon: parseInt(req.query.lon as string),
    };

    const places = await PlaceModel.getTopPlaces(
      selectedFoods,
      selectedFeatures,
      selectedDistance,
      userCoordinates
    );
    return res.json(places);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error while getting top places",
    });
  }
};

const create_place_review = async (req: Request, res: Response) => {
  try {
    const { place_id, rating, textbody } = req.body;

    const created_at = new Date().toISOString();
    await PlaceReview.create_review(
      place_id,
      res.locals.user.user_id,
      textbody,
      rating,
      created_at
    );
    return res.status(201).send({
      status: "ok",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      error: err,
    });
  }
};

const get_place_review = async (req: Request, res: Response) => {
  try {
    const rating = (req.query.rating as string) || "5";
    const place_id = req.query.place_id as string;

    const reviews = await PlaceReview.get_reviews(place_id, rating);
    return res.status(200).send({
      status: "ok",
      reviews,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      error: err,
    });
  }
};

const getPlaceSuggestions = async (req: Request, res: Response) => {
  try {
    const query = req.params.query as string;
    const suggestions = await PlaceModel.getPlaceSuggestionsByQuery(query);
    return res.json(suggestions);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while getting place suggestion",
    });
  }
};

const requestPlaceOwnership = async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;

    const place = await PlaceModel.getPlacebyId(placeId);
    if (!place) {
      return res.status(404).json({
        message: "Place not found",
      });
    }
    if (place.ownedBy) {
      return res.status(403).json({
        message: "Place is already owned by someone",
      });
    }
    const user = await UserModel.getDataById(req.jwtUserData!.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const [imageUrl] = await uploadImage(req.file as Express.Multer.File);
    await OwnershipRequestModel.createOwnershipRequest(
      {
        placeId: placeId,
      } as OwnershipRequestForm,
      imageUrl,
      req.jwtUserData!.userId
    );
    return res.status(201).json();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while requesting place ownership",
    });
  }
};

const getAllOwnershipRequests = async (req: Request, res: Response) => {
  try {
    const ownershipRequests =
      await OwnershipRequestModel.getAllPlaceOwnershipRequests();
    return res.json(ownershipRequests);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while getting all place ownership",
    });
  }
};

const updatePlaceOwnership = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.body;
    await OwnershipRequestModel.grantRequestOwnership(requestId);
    return res.json();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while getting all place ownership",
    });
  }
};

const updatePlaceData = async (req: Request, res: Response) => {
  try {
    const formData = req.body as EditPlaceForm;
    const { placeId } = req.body;
    const place = await PlaceModel.getPlacebyId(placeId);
    if (!place)
      return res.status(404).json({
        message: "Place not found",
      });

    if (place.ownedBy !== req.jwtUserData!.userId) {
      return res.status(403).json({
        message: "Unauthorized action to update place data",
      });
    }

    if (req.file as Express.Multer.File) {
      const [imageUrl] = await uploadImage(req.file as Express.Multer.File);
      formData.coverImgUrl = imageUrl;
    }

    await PlaceModel.updatePlaceById(formData, placeId);
    return res.json();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while updating place data",
    });
  }
};

const createPlace = async (req: Request, res: Response) => {
  try {
    const form: AddPlaceForm = req.body as AddPlaceForm;

    const [imageUrl] = await uploadImage(req.file as Express.Multer.File);

    const createdPlace = await PlaceModel.createMyPlace(form, imageUrl);

    return res.status(201).json(createdPlace);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while creating place ",
    });
  }
};

const getMyPlaces = async (req: Request, res: Response) => {
  try {
    const places = await PlaceModel.getPlacesOfUser(req.jwtUserData!.userId);
    return res.json(places);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while getting your places",
    });
  }
};

const checkPermissionToEditPlace = async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;

    const place = await PlaceModel.getPlacebyId(placeId);
    if (!place) return res.status(404).json();

    if (place.ownedBy == req.jwtUserData!.userId) {
      return res.status(200).json();
    } else {
      return res.status(403).json();
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while checking permission",
    });
  }
};

/* Handle uploading a image or multiple images */
const uploadImages = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images were uploaded." });
    }

    const promises = files.map(async (file) => {
      try {
        const [imageUrl, imageId] = await uploadImage(file);
        if (imageUrl) {
          await PlaceImageModel.addImageToDB(
            imageUrl,
            req.params.placeId,
            req.jwtUserData!.userId,
            req.body.description || "",
            imageId
          );
          return "Successfully uploaded";
        } else {
          throw new Error("Error while uploading: " + file.filename);
        }
      } catch (error) {
        throw error;
      }
    });
    await Promise.all(promises);

    return res.status(201).json({
      message: "Successfully uploaded the image(s)",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while uploading images",
    });
  }
};

/* Get images of a place */
const getImages = async (req: Request, res: Response) => {
  try {
    const images = await PlaceImageModel.getImagesOfPlace(req.params.placeId);
    return res.status(200).json(images);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while getting images",
    });
  }
};

/* Delete a image */
const deleteImage = async (req: Request, res: Response) => {
  try {
    await PlaceImageModel.deleteImage(req.body.cloudinaryId);
    return res.status(204).json();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while deleting image",
    });
  }
};

const getImageInfo = async (req: Request, res: Response) => {
  try {
    const { imageId } = req.params;
    const image = await PlaceImageModel.getSingleImage(parseInt(imageId));
    if (image) return res.status(200).json(image);
    else
      return res.status(404).json({
        message: "Image ID not found",
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while getting image info",
    });
  }
};

const addOperatingHour = async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;
    const form = req.body as OperatingHourForm;
    form.placeId = placeId;

    const result = operatingHourSchema.safeParse(form);
    if (!result.success) {
      console.log(result.error);
      return res.status(400).json(result.error.errors);
    }

    await OperatingHourModel.createOperatingHour(form);
    return res.status(201).json();
  } catch (err) {
    console.log(err);
    if ((err as any).code == DB_CODES.UNIQUE_VIOLATION) {
      return res.status(400).json({
        message: "Cannot add same day twice",
      });
    }
    return res.status(500).json({
      message: "Error while adding operating hour",
    });
  }
};

const deleteOperatingHour = async (req: Request, res: Response) => {
  try {
    const { operatingHourId } = req.body;

    await OperatingHourModel.removeOperatingHour(operatingHourId);
    return res.status(204).json();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while deleting operating hour",
    });
  }
};

const getOperatingHour = async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;
    const operatingHours = await OperatingHourModel.getOperatingHours(
      placeId as string
    );
    if (operatingHours) {
      operatingHours.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
    }
    return res.status(200).json(operatingHours);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while getting operating hours",
    });
  }
};

const addMenuImages = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images were uploaded." });
    }

    const promises = files.map(async (file) => {
      try {
        const [imageUrl, imageId] = await uploadImage(file);
        if (imageUrl) {
          await PlaceImageModel.addImageToDB(
            imageUrl,
            req.params.placeId,
            req.jwtUserData!.userId,
            "MENU",
            imageId,
            true
          );
          return "Successfully uploaded";
        } else {
          throw new Error("Error while uploading: " + file.filename);
        }
      } catch (error) {
        throw error;
      }
    });
    await Promise.all(promises);

    return res.status(201).json();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while uploading images",
    });
  }
};

const getMenuImages = async (req: Request, res: Response) => {
  try {
    const images = await PlaceImageModel.getMenusOfPlace(req.params.placeId);
    return res.status(200).json(images);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while getting images",
    });
  }
};

export default {
  getPlace,
  get_review,
  create_place_review,
  get_place_review,
  getPlaceSuggestions,
  requestPlaceOwnership,
  getAllOwnershipRequests,
  updatePlaceOwnership,
  updatePlaceData,
  getMyTopPlaces,
  createPlace,
  getMyPlaces,
  checkPermissionToEditPlace,
  uploadImages,
  getImages,
  deleteImage,
  getImageInfo,
  addOperatingHour,
  deleteOperatingHour,
  getOperatingHour,
  addMenuImages,
  getMenuImages,
};
