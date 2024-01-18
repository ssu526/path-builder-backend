import { RequestHandler } from "express";
import UserModel from "../models/User";
import HttpError from "../utils/HttpError";
import bcrypt from "bcrypt";
import { SignUpBody, LoginBody } from "../interfaces/body";

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.session.userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const signup: RequestHandler<
  unknown,
  unknown,
  SignUpBody,
  unknown
> = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const passwordRaw = req.body.password;

  try {
    if (!username) throw new HttpError(400, "Username is missing");
    if (!email) throw new HttpError(400, "Email is missing");
    if (!passwordRaw) throw new HttpError(400, "Password is missing");

    const existingUserName = await UserModel.findOne({ username: username });
    if (existingUserName) {
      throw new HttpError(409, "User name already taken.");
    }

    const existingEmail = await UserModel.findOne({ email: email });
    if (existingEmail) {
      throw new HttpError(409, "Email address already taken.");
    }

    const passwordHashed = await bcrypt.hash(passwordRaw, 10);

    const newUser = await UserModel.create({
      username: username,
      email: email,
      password: passwordHashed,
    });

    req.session.userId = newUser._id;
    res.status(200).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler<
  unknown,
  unknown,
  LoginBody,
  unknown
> = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    if (!username) throw new HttpError(400, "Username is missing");
    if (!password) throw new HttpError(400, "Password is missing");

    const user = await UserModel.findOne({ username: username }).select(
      "+password"
    );

    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpError(401, "Invalid credentials");
    }

    req.session.userId = user._id;
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(200);
    }
  });
};
