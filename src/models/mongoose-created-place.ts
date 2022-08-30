import Mongoose, { Schema, InferSchemaType } from "mongoose";
import { Place } from "../types/places-types";

const placeSchema = new Schema<Place>(
    {
        id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        location: { type: Object, required: true },
        address: { type: String, required: true },
        creator: { type: String, required: true },
    },
    { collection: "places" }
);

// type Place = InferSchemaType<typeof placeSchema>;

export default Mongoose.model("PlaceSchema", placeSchema);
