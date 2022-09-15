import * as dotenv from "dotenv";
dotenv.config();

import { RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { stringify } from "querystring";

import HttpError from "../models/http-error";

const authCheck: RequestHandler = (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }

    try {
        const token = req.headers.authorization!.split(" ")[1];

        if (!token) {
            throw new Error("Authentication failed");
        }

        const decodedToken = jwt.verify(
            token,
            process.env.TOKEN_PRIVATE_KEY!
        ) as JwtPayload;

        req.userData = { userId: decodedToken.userId };

        next();
    } catch (err: any) {
        return next(new HttpError("Authentication failed", 401));
    }
};

export default authCheck;
