import * as dotenv from "dotenv";
dotenv.config();

import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { BasicUserInfo } from "../types/users-types";
import HttpError from "../models/http-error";
import UserSchema from "../models/user-schema";

export const getAllUsers: RequestHandler = async (req, res, next) => {
    let users;
    try {
        users = await UserSchema.find({}, "-password").exec();
    } catch (err) {
        return next(
            new HttpError("Fetching users failed, please try again", 500)
        );
    }

    if (!users || users.length === 0) {
        return next(new HttpError("No user info", 404));
    }

    users = users.map((user) => user.toObject({ getters: true }));

    res.status(200).json({
        message: "Get user list",
        users,
    });
};

export const signup: RequestHandler = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please enter again", 422)
        );
    }

    const { name, email, password } = req.body as BasicUserInfo;

    let existingUser;
    try {
        existingUser = await UserSchema.findOne({ email: email }).exec();
    } catch (err) {
        return next(
            new HttpError("Fetching user info failed, please try again", 500)
        );
    }

    if (existingUser) {
        return next(
            new HttpError(
                "The user already exists, please sign in instead",
                422
            )
        );
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(
            new HttpError("Could not create user, please try again", 500)
        );
    }

    const newUser = new UserSchema({
        name,
        email,
        password: hashedPassword,
        image: "https://images.unsplash.com/photo-1604170099361-14f52e9f0c11?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2787&q=80",
        places: [],
    });

    try {
        await newUser.save();
    } catch (err) {
        return next(
            new HttpError(
                "Could not update new user info, please try again",
                500
            )
        );
    }

    let token;
    try {
        token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.TOKEN_PRIVATE_KEY as string,
            { expiresIn: "1h" }
        );
    } catch (err: any) {
        console.log(err.message);
        return next(new HttpError(err.message, 500));
    }

    res.status(201).json({
        message: "Registered the account!",
        userId: newUser.id,
        email: newUser,
        token: token,
    });
};

export const userLogin: RequestHandler = async (req, res, next) => {
    const { email, password } = req.body as { email: string; password: string };

    let existingUser;
    try {
        existingUser = await UserSchema.findOne({ email: email }).exec();
    } catch (err) {
        return next(new HttpError("Logging in failed, please try again", 500));
    }

    if (!existingUser) {
        return next(
            new HttpError(
                "The user does not exist or the password is wrong, please try again",
                422
            )
        );
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        return next(
            new HttpError(
                "Something wrong when logging in, please try again",
                500
            )
        );
    }

    if (!isValidPassword) {
        return next(new HttpError("Invalid credential", 401));
    }

    existingUser = existingUser.toObject({ getters: true });

    console.log(existingUser);

    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            process.env.TOKEN_PRIVATE_KEY as string,
            { expiresIn: "1h" }
        );
    } catch (err: any) {
        console.log(err.message);
        return next(new HttpError(err.message, 500));
    }

    res.status(200).json({
        message: "Logged In",
        userId: existingUser.id,
        token,
    });
};
