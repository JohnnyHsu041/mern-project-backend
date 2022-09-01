import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import Mongoose from "mongoose";

import { User } from "../types/users-types";
import { BasicPlaceInfo } from "../types/places-types";
import HttpError from "../models/http-error";
import { getCoordsForAddress } from "../utils/location";
import PlaceSchema from "../models/place-schema";
import UserSchema from "../models/user-schema";

export const createPlace: RequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data", 422)
        );
    }

    const { title, description, address, creator } = req.body as BasicPlaceInfo;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(
            new HttpError(
                "Something wrong when fetching the place coordinates",
                404
            )
        );
    }

    const createdPlace = new PlaceSchema({
        title,
        image: "https://upload.wikimedia.org/wikipedia/commons/1/10/Empire_State_Building_%28aerial_view%29.jpg",
        description,
        location: coordinates,
        address,
        creator,
    });

    let user;
    try {
        user = await UserSchema.findById(creator).exec();
    } catch (err) {
        return next(
            new HttpError("Fetching user data failed, please try again", 500)
        );
    }

    if (!user) {
        return next(new HttpError("User does not exist", 422));
    }

    try {
        const sess = await Mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace._id);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err);
        return next(
            new HttpError("Creating Place failed, please try again", 500)
        );
    }

    res.status(201).json({
        message: "Created the place",
        place: createdPlace.toObject({ getters: true }),
    });
};

export const getPlace: RequestHandler = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await PlaceSchema.findById(placeId).exec();
    } catch (err) {
        return next(
            new HttpError("Fetching data failed, please try again", 500)
        );
    }

    if (!place) {
        return next(new HttpError("Could not find the place by this id", 422));
    }

    place = place.toObject({ getters: true });

    res.json({ place });
};

export const getPlacesByUserId: RequestHandler = async (req, res, next) => {
    const userId = req.params.uid;

    let places;
    try {
        places = await PlaceSchema.find({ creator: userId }).exec();
    } catch (err) {
        return next(
            new HttpError("Fetching data failed, please try again", 500)
        );
    }

    if (!places || places.length === 0) {
        return next(
            new HttpError(
                "Could not find the places info for the user ID from db",
                404
            )
        );
    }

    places = places.map((place) => place.toObject({ getters: true }));

    res.json({ places });
};

export const updatePlace: RequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data", 422)
        );
    }

    const { title: updatedTitle, description: updatedDescription } =
        req.body as {
            title: string;
            description: string;
        };

    const placeId = req.params.pid;

    let place;
    try {
        place = await PlaceSchema.findById(placeId).exec();
    } catch (err) {
        return next(
            new HttpError("Fetching data failed, please try again", 500)
        );
    }

    if (!place) {
        return next(new HttpError("Could not find the place", 404));
    }

    place.title = updatedTitle;
    place.description = updatedDescription;

    try {
        await place.save();
    } catch (err) {
        return next(
            new HttpError("Something went wrong, could not update", 500)
        );
    }

    res.status(200).json({
        message: "Updated the place info",
        place: place.toObject({ getters: true }),
    });
};

export const deletePlace: RequestHandler = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await PlaceSchema.findById(placeId).populate("creator").exec();
    } catch (err) {
        return next(
            new HttpError("Fetching data failed, please try again", 500)
        );
    }

    if (!place) {
        return next(new HttpError("Could not find the place", 404));
    }

    try {
        const sess = await Mongoose.startSession();
        sess.startTransaction();
        await place.remove({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        return next(
            new HttpError("Deleting data faied, please try again", 500)
        );
    }

    res.status(200).json({
        message: "Deleted the place",
    });
};
