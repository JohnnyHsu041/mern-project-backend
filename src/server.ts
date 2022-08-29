import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";

import HttpError from "./models/http-error";
import placesRoutes from "./routes/places-routes";
import usersRoutes from "./routes/users-routes";

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
    next(new HttpError("Could not find this route", 404));
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.code || 500).json({
        message: err.message || "An unknown error occurred!",
    });
});

app.listen(8080);
