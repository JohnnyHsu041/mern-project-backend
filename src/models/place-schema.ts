import Mongoose, { Schema } from "mongoose";
import { Place } from "../types/places-types";

const placeSchema = new Schema<Place>(
    {
        title: { type: String, required: true },
        image: { type: String, required: true },
        description: { type: String, required: true },
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        address: { type: String, required: true },
        creator: {
            type: Mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "UserSchema",
        },
    },
    { collection: "places" }
);

export default Mongoose.model<Place>("PlaceSchema", placeSchema);
