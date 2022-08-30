import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";

import { User, BasicUserInfo } from "../types/users-types";
import HttpError from "../models/http-error";

const DUMMY_USERS: User[] = [
    {
        id: "u1",
        name: "Johnny",
        email: "test@test.com",
        password: "test123",
    },
];

export const getAllUsers: RequestHandler = (req, res, next) => {
    res.status(200).json({ message: "Get user list", allUsers: DUMMY_USERS });
};

export const createUserAndLogUserIn: RequestHandler = (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please enter again", 422)
        );
    }
    const { name, email, password } = req.body as BasicUserInfo;
    const hasUser = DUMMY_USERS.find((user) => user.email === email);

    if (hasUser) {
        return next(
            new HttpError("Could not create user, email already exists", 422)
        );
    }

    const newUser = {
        id: uuidv4(),
        name,
        email,
        password,
    };

    DUMMY_USERS.push(newUser);

    res.status(201).json({
        message: "Registered the account!",
        newUser,
    });
};

export const userLogin: RequestHandler = (req, res, next) => {
    const { email, password } = req.body as { email: string; password: string };
    const identifiedUser = DUMMY_USERS.find((user) => user.email === email);

    if (!identifiedUser || identifiedUser.password !== password) {
        return next(
            new HttpError(
                "Could not find the user, please make sure if you registered an account",
                401
            )
        );
    }

    res.status(200).json({ message: "Logged In" });
};
