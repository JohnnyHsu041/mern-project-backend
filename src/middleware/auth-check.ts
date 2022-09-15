import { RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { stringify } from "querystring";

import HttpError from "../models/http-error";

const authCheck: RequestHandler = (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }

    try {
        const token = req.headers.authorization!.split(" ")[1]; // "Bearer TOKEN"
        if (!token) {
            throw new Error("Authentication failed");
        }

        const decodedToken = jwt.verify(
            token,
            "super_secret_key"
        ) as JwtPayload;

        req.userData = { userId: decodedToken.userId };

        next();
    } catch (err: any) {
        return next(new HttpError("Authentication failed", 401));
    }
};

export default authCheck;
