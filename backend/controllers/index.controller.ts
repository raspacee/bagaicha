import { Request, Response, NextFunction } from "express";
import PlaceModel from "../models/place.model";
import PostModel from "../models/post.model";
import Search from "../models/searchModel";
import { SearchResultsResponse } from "../types";

const getSearchResults = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const placePage = parseInt(req.query.placePage as string) || 1;
    const postPage = parseInt(req.query.postPage as string) || 1;
    const pageSize = 10;

    const placeOffset = (placePage - 1) * pageSize;
    const postOffset = (postPage - 1) * pageSize;

    const placesTotalCount = await PlaceModel.getTotalSearchResults(q);
    const postsTotalCount = await PostModel.getTotalSearchResults(q);

    const places = await PlaceModel.searchPlace(q, placeOffset);
    const posts = await PostModel.searchPosts(
      req.jwtUserData!.userId,
      q,
      postOffset
    );

    const placesTotalPage = Math.ceil(placesTotalCount.count / pageSize);
    const postsTotalPage = Math.ceil(postsTotalCount.count / pageSize);

    // await Search.add_to_history(res.locals.user.user_id, q);
    return res.json({
      place: {
        places: places,
        totalItems: placesTotalCount.count,
        totalPages: placesTotalPage,
      },
      post: {
        posts: posts,
        totalItems: placesTotalCount.count,
        totalPages: postsTotalPage,
      },
    } as SearchResultsResponse);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while getting search results",
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
  getSearchResults,
  get_search_history,
  delete_search_history,
};

export default exporter;
