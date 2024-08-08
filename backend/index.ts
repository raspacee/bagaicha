import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import indexRouter from "./routes/indexRouter";
import authRouter from "./routes/auth.router";
import postRouter from "./routes/post.router";
import userRouter from "./routes/user.router";
import placeRouter from "./routes/place.router";
import notificationRouter from "./routes/notification.router";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    optionsSuccessStatus: 200,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use("/api", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);
app.use("/api/user", userRouter);
app.use("/api/place", placeRouter);
app.use("/api/notifications", notificationRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  return res.status(400).send(err);
});

app.listen(process.env.PORT || 8080, () =>
  console.log("Application listening on port: " + process.env.PORT || 8080)
);
