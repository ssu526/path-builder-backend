import { RequestHandler } from "express";
import HttpError from "../utils/HttpError";

export const checkAuthentication: RequestHandler = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    throw new HttpError(401, "Unauthenticated.");
  }
};
