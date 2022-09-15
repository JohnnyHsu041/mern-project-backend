"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlace = exports.updatePlace = exports.getPlacesByUserId = exports.getPlace = exports.createPlace = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const http_error_1 = __importDefault(require("../models/http-error"));
const location_1 = require("../utils/location");
const place_schema_1 = __importDefault(require("../models/place-schema"));
const user_schema_1 = __importDefault(require("../models/user-schema"));
const createPlace = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new http_error_1.default("Invalid inputs passed, please check your data", 422));
    }
    const { title, description, address } = req.body;
    let coordinates;
    try {
        coordinates = yield (0, location_1.getCoordsForAddress)(address);
    }
    catch (error) {
        return next(new http_error_1.default("Something wrong when fetching the place coordinates", 404));
    }
    const createdPlace = new place_schema_1.default({
        title,
        image: "https://upload.wikimedia.org/wikipedia/commons/1/10/Empire_State_Building_%28aerial_view%29.jpg",
        description,
        location: coordinates,
        address,
        creator: req.userData.userId,
    });
    let user;
    try {
        user = yield user_schema_1.default.findById(req.userData.userId).exec();
    }
    catch (err) {
        return next(new http_error_1.default("Fetching user data failed, please try again", 500));
    }
    if (!user) {
        return next(new http_error_1.default("User does not exist", 422));
    }
    try {
        const sess = yield mongoose_1.default.startSession();
        sess.startTransaction();
        yield createdPlace.save({ session: sess });
        user.places.push(createdPlace._id);
        yield user.save({ session: sess });
        yield sess.commitTransaction();
    }
    catch (err) {
        return next(new http_error_1.default("Creating Place failed, please try again", 500));
    }
    res.status(201).json({
        message: "Created the place",
        place: createdPlace.toObject({ getters: true }),
    });
});
exports.createPlace = createPlace;
const getPlace = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const placeId = req.params.pid;
    let place;
    try {
        place = yield place_schema_1.default.findById(placeId).exec();
    }
    catch (err) {
        return next(new http_error_1.default("Fetching data failed, please try again", 500));
    }
    if (!place) {
        return next(new http_error_1.default("Could not find the place by this id", 422));
    }
    place = place.toObject({ getters: true });
    res.json({ place });
});
exports.getPlace = getPlace;
const getPlacesByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.uid;
    let userWithPlaces;
    try {
        userWithPlaces = yield user_schema_1.default.findById(userId)
            .populate("places")
            .exec();
    }
    catch (err) {
        return next(new http_error_1.default("Fetching data failed, please try again", 500));
    }
    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        return next(new http_error_1.default("Could not find the places info for the user ID from db", 404));
    }
    userWithPlaces = userWithPlaces.places.map((place) => place.toObject({ getters: true }));
    res.json({ places: userWithPlaces });
});
exports.getPlacesByUserId = getPlacesByUserId;
const updatePlace = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new http_error_1.default("Invalid inputs passed, please check your data", 422));
    }
    const { title: updatedTitle, description: updatedDescription } = req.body;
    const placeId = req.params.pid;
    let place;
    try {
        place = yield place_schema_1.default.findById(placeId).exec();
    }
    catch (err) {
        return next(new http_error_1.default("Fetching data failed, please try again", 500));
    }
    if (!place) {
        return next(new http_error_1.default("Could not find the place", 404));
    }
    if (place.creator.toString() !== req.userData.userId) {
        return next(new http_error_1.default("You are not allowed to edit this place", 401));
    }
    place.title = updatedTitle;
    place.description = updatedDescription;
    try {
        yield place.save();
    }
    catch (err) {
        return next(new http_error_1.default("Something went wrong, could not update", 500));
    }
    res.status(200).json({
        message: "Updated the place info",
        place: place.toObject({ getters: true }),
    });
});
exports.updatePlace = updatePlace;
const deletePlace = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const placeId = req.params.pid;
    let place;
    try {
        place = yield place_schema_1.default.findById(placeId).populate("creator").exec();
    }
    catch (err) {
        return next(new http_error_1.default("Fetching data failed, please try again", 500));
    }
    if (!place) {
        return next(new http_error_1.default("Could not find the place", 404));
    }
    if (place.creator.id !== req.userData.userId) {
        return next(new http_error_1.default("You are not allowed to delete this place", 401));
    }
    try {
        const sess = yield mongoose_1.default.startSession();
        sess.startTransaction();
        yield place.remove({ session: sess });
        place.creator.places.pull(place);
        yield place.creator.save({ session: sess });
        yield sess.commitTransaction();
    }
    catch (err) {
        return next(new http_error_1.default("Deleting data faied, please try again", 500));
    }
    res.status(200).json({
        message: "Deleted the place",
    });
});
exports.deletePlace = deletePlace;
