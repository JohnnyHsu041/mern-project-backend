import { ObjectId } from "mongodb";
import Mongoose, { PopulatedDoc, Document } from "mongoose";

import { Place } from "../types/places-types";

export interface BasicUserInfo {
    name: string;
    email: string;
    password: string;
}

export interface User extends BasicUserInfo {
    name: string;
    email: string;
    password: string;
    image: string;
    places: PopulatedDoc<Place & Document>[];
    // places: Mongoose.Schema.Types.ObjectId[];
}
