import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";

import PlaceModel from "../models/place.model";
import PlaceReview from "../models/placeReviewModel";
import UserModel from "../models/user.model";
import OwnershipRequestModel from "../models/ownershipRequest.model";
import { Distances } from "../lib/enums";
import { uploadImage } from "../utils/image";
import { OwnershipRequestForm } from "../types";

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

const update_place_info = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const place_id = req.params.place_id as string;
  const {
    open_days,
    opening_time,
    closing_time,
    place_features,
    thumbnail_img_old,
    cover_img_old,
  } = req.body;

  try {
    const files = req.files as ImageInterface;
    let thumbnail_img: string = thumbnail_img_old;
    let cover_img: string = cover_img_old;
    if (files.thumbnail_img) {
      const picture_upload = await cloudinary.uploader.upload(
        files.thumbnail_img[0].path
      );
      thumbnail_img = picture_upload.secure_url;
    }
    if (files.cover_img) {
      const picture_upload = await cloudinary.uploader.upload(
        files.cover_img[0].path
      );
      cover_img = picture_upload.secure_url;
    }

    await PlaceModel.update_place(
      place_id,
      JSON.parse(open_days),
      JSON.parse(opening_time) || null,
      JSON.parse(closing_time) || null,
      JSON.parse(place_features),
      thumbnail_img,
      cover_img
    );
    return res.status(200).send({
      status: "ok",
      message: "Place information updated successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      err,
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

const top_places = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string;
    const suggested = req.query.suggested as string;
    const lat = req.query.lat as string;
    const long = req.query.long as string;
    if (lat == "" || long == "") {
      return res.status(400).send({
        status: "error",
        message: "Please provide user latitude and longitude",
      });
    }

    let categories: string[] | null;
    if (category == "") categories = null;
    else categories = category.split(",");

    let suggestions: number[] | null;
    if (suggested == "") suggestions = null;
    else {
      let tmp: any = suggested.split(",");
      /* Map strings to number representations */
      tmp = tmp.map((s: any) => {
        for (let i = 0; i < place_features.length; i++) {
          if (place_features[i].key == s) return place_features[i].value;
        }
        return null;
      });
      suggestions = tmp!.filter((s: any) => s != null);
    }

    let distance: Distances | null = parseInt(req.query.distance as string);
    if (distance == Distances.NONE) distance = null;
    const places = await PlaceModel.get_top_places(
      parseFloat(lat),
      parseFloat(long),
      categories,
      suggestions,
      distance
    );
    return res.status(200).send({
      status: "ok",
      places,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      error: err,
    });
  }
};

const create_place = async (req: Request, res: Response) => {
  try {
    const {
      placeName,
      placeLat,
      placeLong,
      foods,
      drinks,
      relation,
      alcoholAllowed,
    } = req.body;
    const files = req.files as ImageInterface;
    const picture_upload = await cloudinary.uploader.upload(
      files.displayPic[0].path
    );
    let foods_offered = JSON.parse(foods);
    foods_offered.concat(JSON.parse(drinks));
    const displayPic = picture_upload.secure_url;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${placeLat}&lon=${placeLong}&format=json`
    );
    const data = await response.json();
    const owned_by = relation == "owner" ? res.locals.user.user_id : null;
    await PlaceModel.add_place(
      uuidv4(),
      placeName,
      placeLat,
      placeLong,
      foods_offered,
      data.display_name,
      displayPic,
      owned_by,
      JSON.parse(alcoholAllowed),
      data.place_id
    );
    return res.status(200).send({
      status: "ok",
      message: "Successfully created the place",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      error: err,
    });
  }
};

const search_place = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const places = await PlaceModel.search_place(q);
    return res.status(200).send({
      status: "ok",
      places,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      error: err,
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

const exporter = {
  getPlace,
  get_review,
  top_places,
  update_place_info,
  create_place,
  search_place,
  create_place_review,
  get_place_review,
  getPlaceSuggestions,
  requestPlaceOwnership,
  getAllOwnershipRequests,
  updatePlaceOwnership,
};

export default exporter;
