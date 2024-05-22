import express from "express";
const router = express.Router();

import indexController from "../controllers/indexController";

router.get("/", indexController.get_handler);

export default router;
