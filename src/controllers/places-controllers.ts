import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";

import HttpError from "../models/http-error";
import { getCoordsForAddress } from "../utils/location";

interface BasicPlaceInfo {
    title: string;
    description: string;
    address: string;
    creator: string;
}

interface Place extends BasicPlaceInfo {
    id: string;
    title: string;
    description: string;
    location: {
        lat: number;
        lng: number;
    };
    address: string;
    creator: string;
}

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
    {
        id: "p2",
        title: "Empire State Building!!!!!",
        description: "One of the most famous sky scrappers in the world",
        location: {
            lat: 40.7484474,
            lng: -73.9871516,
        },
        address: "test street test road 101",
        creator: "u1",
    },
    {
        id: "p3",
        title: "Empire State Building??????",
        description: "One of the most famous sky scrappers in the world",
        location: {
            lat: 40.7484474,
            lng: -73.9871516,
        },
        address: "test street test road 101",
        creator: "u2",
    },
];

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
        return next(error);
    }

    const createdPlace: Place = {
        id: uuidv4(),
        title,
        description,
        location: coordinates,
        address,
        creator,
    };

    DUMMY_PLACES.push(createdPlace);

    res.status(201).json({
        message: "Created the place",
        allPlaces: DUMMY_PLACES,
    });
};

export const getPlace: RequestHandler = (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find((place) => place.id === placeId);

    if (!place) {
        throw new HttpError("Could not find the place!", 404);
    }

    res.json({ place });
};

export const getPlacesByUserId: RequestHandler = (req, res, next) => {
    const userId = req.params.uid;
    const places = DUMMY_PLACES.filter((place) => place.creator === userId);

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

    // copy the place
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
