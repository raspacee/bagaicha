import express from "express";
const router = express.Router();

import placeController from "../controllers/place.controller";
import placeReviewController from "../controllers/placeReview.controller";
import foodController from "../controllers/food.controller";
import {
  authMiddleware,
  isAdminOrOwnerMiddleware,
  verifyAdminMiddleware,
} from "../middlewares/auth.middleware";
import { modMiddleware } from "../middlewares/modMiddleware";
import upload from "../multer";
import { PLACE_CONFIG } from "../utils/config";

/* Get all available features available */
router.get("/feature/all", placeController.getAllFeatures);

/* Delete image of a place */
router.delete(
  "/image",
  authMiddleware,
  modMiddleware,
  placeController.deleteImage
);

/* Upload image(s) for a place */
router.post(
  "/:placeId/image",
  authMiddleware,
  upload.array("images[]", PLACE_CONFIG.MAXIMUM_IMAGES_UPLOAD_ALLOWED),
  placeController.uploadImages
);

/* Get image(s) of a place */
router.get("/:placeId/image", placeController.getImages);

/* Get information of a single image */
router.get("/image/:imageId", placeController.getImageInfo);

router.get("/top", placeController.getMyTopPlaces);

router.get(
  "/ownership",
  authMiddleware,
  verifyAdminMiddleware,
  placeController.getAllOwnershipRequests
);

/* Endpoint to get place names suggestions */
router.get("/suggestion/:query", placeController.getPlaceSuggestions);

router.post(
  "/:placeId/ownership",
  authMiddleware,
  upload.single("documentImage"),
  placeController.requestPlaceOwnership
);
router.put(
  "/:placeId/ownership",
  authMiddleware,
  verifyAdminMiddleware,
  placeController.updatePlaceOwnership
);
router.delete(
  "/:placeId/ownership",
  authMiddleware,
  verifyAdminMiddleware,
  placeController.requestPlaceOwnership
);

router.get("/my", authMiddleware, placeController.getMyPlaces);

router.get(
  "/:placeId/checkPermission",
  authMiddleware,
  placeController.checkPermissionToEditPlace
);

/* Get operating hours of a place */
router.get("/:placeId/operatinghour", placeController.getOperatingHour);

/* Add a new operating hour */
router.post(
  "/:placeId/operatinghour",
  authMiddleware,
  modMiddleware,
  placeController.addOperatingHour
);

/* Delete a operating hour */
router.delete(
  "/:placeId/operatinghour",
  authMiddleware,
  modMiddleware,
  placeController.deleteOperatingHour
);

/* Update place information */
router.put(
  "/:placeId",
  authMiddleware,
  upload.single("image"),
  placeController.updatePlaceData
);

/* Add a menu image */
router.post(
  "/:placeId/menu",
  authMiddleware,
  verifyAdminMiddleware,
  upload.array("images[]", 10),
  placeController.addMenuImages
);

/* Delete a menu image */
router.delete(
  "/:placeId/menu",
  authMiddleware,
  verifyAdminMiddleware,
  placeController.deleteImage
);

/* Get menu images of a place */
router.get("/:placeId/menu", placeController.getMenuImages);

/* Create a place's review */
router.post(
  "/:placeId/review",
  authMiddleware,
  upload.single("image"),
  placeReviewController.createPlaceReview
);

/* Get all reviews of a place */
router.get("/:placeId/review", placeReviewController.getAllReviews);

/* Delete a review */
router.delete(
  "/:placeId/review",
  authMiddleware,
  placeReviewController.deletePlaceReview
);

/* Get all features of a place */
router.get("/:placeId/feature", placeController.getAllFeaturesOfPlace);

/* Add one feature to a place */
router.post(
  "/:placeId/feature",
  authMiddleware,
  verifyAdminMiddleware,
  placeController.addFeatureToPlace
);

/* Delete feature from a place */
router.delete(
  "/:placeId/feature",
  authMiddleware,
  verifyAdminMiddleware,
  placeController.removeFeatureFromPlace
);

/* Get all foods of a place */
router.get("/:placeId/food", foodController.getFoodsOfPlace);

/* Add a food item to a place */
router.post(
  "/:placeId/food",
  authMiddleware,
  isAdminOrOwnerMiddleware,
  foodController.addFoodToPlace
);

/* Delete a food item of a place */
router.delete(
  "/:placeId/food",
  authMiddleware,
  isAdminOrOwnerMiddleware,
  foodController.deleteFoodOfPlace
);

/* Update a food item of a place */
router.put(
  "/:placeId/food",
  authMiddleware,
  isAdminOrOwnerMiddleware,
  foodController.updateFoodOfPlace
);

/* Get place data */
router.get("/:placeId", placeController.getPlace);

/* Create a new place */
router.post(
  "/",
  authMiddleware,
  upload.single("imageFile"),
  placeController.createPlace
);

export default router;
