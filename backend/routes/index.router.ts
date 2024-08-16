import express, { Request, Response } from "express";
const router = express.Router();

import indexController from "../controllers/index.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

router.get("/health", async (req: Request, res: Response) => {
  return res.json("Server is working fine");
});

/* Get search results */
router.get("/search", authMiddleware, indexController.getSearchResults);

/* Get search history */
router.get(
  "/search/history",
  authMiddleware,
  indexController.get_search_history
);

/* Delete search history */
router.delete(
  "/search/history",
  authMiddleware,
  indexController.delete_search_history
);

export default router;
