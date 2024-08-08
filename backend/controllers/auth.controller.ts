import { Request, Response, NextFunction } from "express";
import UserModel from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { JwtUserData, LoginForm, SignupForm } from "../types";

const signupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = req.body as SignupForm;

  try {
    const existingUser = await UserModel.getDataByEmail(data.email);
    if (existingUser) {
      return res.status(409).json();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    data.password = hashedPassword;

    await UserModel.createUser(data);

    return res.status(201).json();
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body as LoginForm;

  try {
    const user = await UserModel.getPasswordByEmail(email);
    if (user == null) {
      return res.status(404).json(null);
    }
    if (bcrypt.compareSync(password, user.password)) {
      const payload: JwtUserData = {
        userId: user.id,
        email: user.email,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: "30d",
      });
      return res.json({ token });
    } else {
      return res.status(401).json(null);
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

const auth_handler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.json({
    authenticated: true,
  });
};

const mod_authenticate = async (req: Request, res: Response) => {
  return res.status(200).send({
    status: "ok",
  });
};

const exporter = {
  signupHandler,
  loginHandler,
  auth_handler,
  mod_authenticate,
};

export default exporter;
