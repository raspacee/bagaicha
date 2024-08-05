import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import Review from "../models/reviewModel";
import { v2 as cloudinary } from "cloudinary";

const get_user_info = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const slug = req.params.slug;
  try {
    let user;
    if (slug) {
      user = await User.get_user_all_info(slug);
    } else {
      user = await User.get_info_by_id(res.locals.user.user_id);
    }
    if (user == null) {
      return next(new Error("User not found"));
    }
    return res.status(200).send({
      status: "ok",
      user,
    });
  } catch (err) {
    return next(err);
  }
};

const getMyUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.getDataById(req.jwtUserData!.userId);
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

const change_profile_picture = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const picture_path = req.file!.path;
    const picture_upload = await cloudinary.uploader.upload(picture_path);

    await User.change_profile_pic_url(
      res.locals.user.user_id,
      picture_upload.secure_url
    );

    return res.status(200).send({
      status: "ok",
      message: "Profile picture changed",
    });
  } catch (err) {
    return next(err);
  }
};

const get_user_reviews = async (req: Request, res: Response) => {
  try {
    const email = req.params.user_email;
    const reviews = await Review.get_reviews_by_email(
      res.locals.user.user_id,
      email
    );
    return res.status(200).send({
      status: "ok",
      reviews,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

interface ImageInterface {
  new_profile_pic?: any;
}

const update_profile = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    const { first_name, last_name, bio } = req.body;

    let profile_pic: string | null = null;
    const files = req.files as ImageInterface;
    if (files.new_profile_pic) {
      const picture_upload = await cloudinary.uploader.upload(
        files.new_profile_pic[0].path
      );
      profile_pic = picture_upload.secure_url;
    }
    await User.update_profile(
      user.user_id,
      first_name,
      last_name,
      bio,
      profile_pic
    );

    return res.status(200).send({
      status: "ok",
      message: "Successfully updated user settings",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const exporter = {
  get_user_info,
  change_profile_picture,
  get_user_reviews,
  update_profile,
  getMyUserData,
};

export default exporter;
