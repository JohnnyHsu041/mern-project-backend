import * as dotenv from "dotenv";
dotenv.config();

import axios from "axios";

import { Coordinates } from "../types/places-types";
import HttpError from "../models/http-error";

const API_KEY = process.env.GOOGLE_API_KEY;

type getCoordsFunction = (address: string) => Promise<Coordinates>;

export const getCoordsForAddress: getCoordsFunction = async (address) => {
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
        )}&key=${process.env.GOOGLE_API_KEY}`
    );

    const data = response.data;

    if (!data || data.status === "ZERO_RESULTS") {
        throw new HttpError(
            "Could not find the location for the specified address",
            422
        );
    }

    const coordinates: Coordinates = data.results[0].geometry.location;

    return coordinates;
};
