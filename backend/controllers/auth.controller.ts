import { Request, Response, NextFunction } from "express";
import UserModel from "../models/user.model";
import bcrypt, { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "redis";
import {
  ForgotPasswordForm,
  JwtUserData,
  LoginForm,
  ResetPasswordDecoded,
  ResetPasswordForm,
  SignupForm,
} from "../types";
import { hashPassword } from "../utils/password";
import { createMailTransporter, getMailAccessToken } from "../utils/gmail";

const signupHandler = async (req: Request, res: Response) => {
  const data = req.body as SignupForm;

  try {
    const existingUser = await UserModel.getDataByEmail(data.email);
    if (existingUser) {
      return res.status(409).json({
        message: "Email is already used",
      });
    }

    data.password = await hashPassword(data.password);

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
    user: req.jwtUserData,
  });
};

const mod_authenticate = async (req: Request, res: Response) => {
  return res.status(200).send({
    status: "ok",
  });
};

const adminHandler = (req: Request, res: Response) => {
  return res.json({
    isAdmin: true,
  });
};

const getResetPasswordToken = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as ForgotPasswordForm;

    const user = await UserModel.getDataByEmail(email);
    if (!user) return res.status(404).json();

    const data: ResetPasswordDecoded = {
      id: user.id,
      email: email,
    };

    jwt.sign(
      data,
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
      async function (err, resetToken) {
        if (err) throw err;
        // Send email to user
        const accesToken = await getMailAccessToken();
        if (!accesToken) throw new Error();

        const transporter = await createMailTransporter(accesToken);

        const mailOptions = {
          to: email,
          subject: "Password Reset Link",
          text: `You can reset your password by going to this link: ${process.env.FRONTEND_URL}/reset-password/${resetToken}.
          You only have 15 minutes before this link expires.`,
        };
        await transporter.sendMail(mailOptions);

        const client = createClient({
          password: process.env.REDIS_PASS,
          socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT || "14460"),
          },
        });
        await client.connect();
        const hashKey = `user:${user.id}`;
        await client.hSet(hashKey, "resetToken", resetToken!);
        await client.expire(hashKey, 15 * 60); // 15 minutes
        await client.disconnect();
        return res.status(200).json();
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error while resetting password",
    });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken } = req.params;

    jwt.verify(
      resetToken,
      process.env.JWT_SECRET!,
      async function (err, decoded) {
        if (err)
          return res.status(401).json({
            message: "Invalid password reset token",
          });
        const data = decoded as ResetPasswordDecoded;

        // Check if the token has been used already
        const client = createClient({
          password: process.env.REDIS_PASS,
          socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT || "14460"),
          },
        });
        await client.connect();
        const result = await client.hGet(`user:${data.id}`, "resetToken");
        if (!result || result == "null")
          return res.status(401).json({
            message: "Invalid password reset token",
          });

        const formData = req.body as ResetPasswordForm;
        const hashedPassword = await hashPassword(formData.password);
        await UserModel.changePassword(data.id, hashedPassword);

        // Invalidate the token
        await client.hSet(`user:${data.id}`, "resetToken", "null");
        await client.disconnect();
        return res.status(204).json();
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error while resetting password",
    });
  }
};

const exporter = {
  signupHandler,
  loginHandler,
  auth_handler,
  mod_authenticate,
  adminHandler,
  getResetPasswordToken,
  resetPassword,
};

export default exporter;
