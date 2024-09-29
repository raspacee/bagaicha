import express from "express";
const router = express.Router();

import placeController from "../controllers/place.controller";
import {
  authMiddleware,
  verifyAdminMiddleware,
} from "../middlewares/auth.middleware";
import { modMiddleware } from "../middlewares/modMiddleware";
import upload from "../multer";
import { PLACE_CONFIG } from "../utils/config";

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
  upload.array("images", PLACE_CONFIG.MAXIMUM_IMAGES_UPLOAD_ALLOWED),
  placeController.uploadImages
);

/* Get image(s) of a place */
router.get("/:placeId/image", placeController.getImages);

router.get("/top", authMiddleware, placeController.getMyTopPlaces);

/* Get a place reviews */
router.get("/review", authMiddleware, placeController.get_place_review);

/* Create a review for a place */
router.post("/review", authMiddleware, placeController.create_place_review);

router.get(
  "/ownership",
  authMiddleware,
  verifyAdminMiddleware,
  placeController.getAllOwnershipRequests
);

router.get("/:place_id/rating/:rating", placeController.get_review);

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

/* Update place information */
router.put(
  "/:placeId",
  authMiddleware,
  upload.single("image"),
  placeController.updatePlaceData
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
