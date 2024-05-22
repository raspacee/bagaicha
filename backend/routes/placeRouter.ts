import express from "express";
const router = express.Router();

import placeController from "../controllers/placeController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { modMiddleware } from "../middlewares/modMiddleware";
import upload from "../multer";

router.post(
  "/",
  authMiddleware,
  upload.fields([{ name: "displayPic", maxCount: 1 }]),
  placeController.create_place,
);

/* Search place names by query */
router.get("/search", placeController.search_place);

router.get("/top_places", placeController.top_places);
router.get("/:place_id", placeController.get_place_info);
router.put(
  "/:place_id",
  authMiddleware,
  modMiddleware,
  upload.fields([
    { name: "thumbnail_img", maxCount: 1 },
    { name: "cover_img", maxCount: 1 },
  ]),
  placeController.update_place_info,
);
router.get("/:place_id/rating/:rating", placeController.get_review);

export default router;
