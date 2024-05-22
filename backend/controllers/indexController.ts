import express, { Request, Response, NextFunction } from "express";
// import { query, pool } from "../db/index.ts";

const get_handler = (req: Request, res: Response, next: NextFunction) => {
  return res
    .status(200)
    .send(
      "Linux was first named FREAX, fortunately someone convinced him to change the name to Linux. phew!"
    );
};

const exporter = {
  get_handler,
};

export default exporter;
