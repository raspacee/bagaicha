import express, { Request, Response, NextFunction } from "express";
import Place from "../models/place.model";
import Review from "../models/post.model";
import Search from "../models/searchModel";
// import { query, pool } from "../db/index.ts";

const search_results = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const q = req.query.q as string;

    const places = await Place.search_place(q);
    const reviews = await Review.search_reviews(res.locals.user.user_id, q);

    await Search.add_to_history(res.locals.user.user_id, q);

    return res.status(200).send({
      status: "ok",
      places,
      reviews,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const get_search_history = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    const results = await Search.get_history(user.user_id);
    return res.status(200).send({
      status: "ok",
      results,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const delete_search_history = async (req: Request, res: Response) => {
  try {
    await Search.delete_history(res.locals.user.user_id);
    return res.status(200).send({
      status: "ok",
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const exporter = {
  search_results,
  get_search_history,
  delete_search_history,
};

export default exporter;
