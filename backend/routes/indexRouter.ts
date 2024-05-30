import express from "express";
const router = express.Router();

import indexController from "../controllers/indexController";
import { authMiddleware } from "../middlewares/authMiddleware";

/* Get search results */
router.get("/search", authMiddleware, indexController.search_results);

/* Get search history */
router.get(
  "/search/history",
  authMiddleware,
  indexController.get_search_history,
);

/* Delete search history */
router.delete(
  "/search/history",
  authMiddleware,
  indexController.delete_search_history,
);

export default router;
