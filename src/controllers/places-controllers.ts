import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import { MongoClient } from "mongodb";

import { Place, BasicPlaceInfo } from "../types/places-types";
import HttpError from "../models/http-error";
import { getCoordsForAddress } from "../utils/location";
import PlaceSchema from "../models/mongoose-created-place";
import Mongoose from "mongoose";

const DUMMY_PLACES: Place[] = [
    {
        id: "p1",
        title: "Empire State Building",
        description: "One of the most famous sky scrappers in the world",
        location: {
            lat: 40.7484474,
            lng: -73.9871516,
        },
        address: "test street test road 101",
        creator: "u1",
    },
];

Mongoose.connect(
    "mongodb+srv://Johnny:As6584235079@cluster0.ezakmlr.mongodb.net/place-list?retryWrites=true&w=majority"
)
    .then(() => console.log("Connected to the database!"))
    .catch(() => console.log("Connecting failed!"));

const mongoDbUrl =
    "mongodb+srv://Johnny:As65$84235079@cluster0.ezakmlr.mongodb.net/?retryWrites=true&w=majority";

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
        id: uuidv4(),
        title,
        description,
        location: coordinates,
        address,
        creator,
    });

    const result = await createdPlace.save();

    res.status(201).json({
        message: "Created the place",
        place: result,
    });
};

export const getPlace: RequestHandler = async (req, res, next) => {
    const placeId = req.params.pid;

    let client;
    let dataFromDb;
    try {
        client = await MongoClient.connect(mongoDbUrl);
        const db = client.db("place-list");
        const placeCollection = db.collection("places");
        dataFromDb = await placeCollection.find().toArray();
    } catch (error) {
        return next(
            new HttpError(
                "Something wrong when fetching place data from db",
                404
            )
        );
    }

    await client.close();

    const place = dataFromDb.find((place) => place.id === placeId);

    if (!place) {
        return next(new HttpError("Could not find the place!", 404));
    }

    res.json({ place });
};

export const getPlacesByUserId: RequestHandler = async (req, res, next) => {
    const userId = req.params.uid;

    let client;
    let dataFromDb;
    try {
        client = await MongoClient.connect(mongoDbUrl);
        const db = client.db("place-list");
        const placeCollection = db.collection("places");
        dataFromDb = await placeCollection.find().toArray();
    } catch (error) {
        return next(
            new HttpError(
                "Something wrong when fetching place data from db",
                404
            )
        );
    }

    await client.close();

    const places = dataFromDb.filter((place) => place.creator === userId);

    if (!places || places.length === 0) {
        return next(
            new HttpError("Could not find places for provided user ID", 404)
        );
    }

    res.json({ places });
};

export const updatePlace: RequestHandler = (req, res, next) => {
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
    const placeIndex = DUMMY_PLACES.findIndex((place) => place.id === placeId);

    if (placeIndex < 0) {
        return next(new HttpError("Could not find the place", 404));
    }

    // copy the place rather than just modifying original data
    const updatedPlace = {
        ...DUMMY_PLACES[placeIndex],
    };
    updatedPlace.title = updatedTitle;
    updatedPlace.description = updatedDescription;

    DUMMY_PLACES[placeIndex] = updatedPlace;

    res.status(200).json({
        message: "Updated the place info",
        place: updatedPlace,
    });
};

export const deletePlace: RequestHandler = (req, res, next) => {
    const placeId = req.params.pid;
    const placeIndex = DUMMY_PLACES.findIndex((place) => place.id === placeId);

    if (placeIndex < 0) {
        return next(new HttpError("Could not find the place", 404));
    }

    DUMMY_PLACES.splice(placeIndex, 1);

    res.status(200).json({
        message: "Deleted the place",
        allPlaces: DUMMY_PLACES,
    });
};
