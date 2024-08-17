import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";

import PlaceModel from "../models/place.model";
import PlaceReview from "../models/placeReviewModel";
import UserModel from "../models/user.model";
import OwnershipRequestModel from "../models/ownershipRequest.model";
import { Distances } from "../lib/enums";
import { uploadImage } from "../utils/image";
import {
  AddPlaceForm,
  Distance,
  EditPlaceForm,
  FoodsOffered,
  OwnershipRequestForm,
  PlaceFeature,
  UserLocation,
} from "../types";

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
    return next(err);
  }
};

interface ImageInterface {
  thumbnail_img?: any;
  cover_img?: any;
  displayPic?: any;
}

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

    const imageUrl = await uploadImage(req.file as Express.Multer.File);
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
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
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

    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const createdPlace = await PlaceModel.createMyPlace(form, imageUrl);

    return res.status(201).json(createdPlace);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while creating place ",
    });
  }
};

const exporter = {
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
};

export default exporter;
