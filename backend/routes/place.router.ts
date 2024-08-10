import express from "express";
const router = express.Router();

import placeController from "../controllers/place.controller";
import {
  authMiddleware,
  verifyAdminMiddleware,
} from "../middlewares/auth.middleware";
import { modMiddleware } from "../middlewares/modMiddleware";
import upload from "../multer";

/* Create a new place */
router.post(
  "/",
  authMiddleware,
  upload.fields([{ name: "displayPic", maxCount: 1 }]),
  placeController.create_place
);

/* Search place names by query */
router.get("/search", placeController.search_place);

router.get("/top_places", placeController.top_places);

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

/* Update place information */
router.put(
  "/:place_id",
  authMiddleware,
  modMiddleware,
  upload.fields([
    { name: "thumbnail_img", maxCount: 1 },
    { name: "cover_img", maxCount: 1 },
  ]),
  placeController.update_place_info
);

router.get("/:place_id/rating/:rating", placeController.get_review);

/* Get place data */
router.get("/:placeId", placeController.getPlace);

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

export default router;
