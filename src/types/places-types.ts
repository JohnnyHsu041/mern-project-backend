import Mongoose, { PopulatedDoc, Document } from "mongoose";
import { User } from "./users-types";

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface BasicPlaceInfo {
    title: string;
    description: string;
    address: string;
    creator: PopulatedDoc<User & Document>;
    // creator: Mongoose.Schema.Types.ObjectId;
}

export interface Place extends BasicPlaceInfo {
    title: string;
    image: string;
    description: string;
    location: Coordinates;
    address: string;
    creator: PopulatedDoc<User & Document>;
    // creator: Mongoose.Schema.Types.ObjectId;
}
