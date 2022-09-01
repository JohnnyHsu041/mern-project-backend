import Mongoose, { Schema } from "mongoose";
import UniqueValidator from "mongoose-unique-validator";

import { User } from "../types/users-types";

const userSchema = new Schema<User>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, minlength: 6 },
        image: { type: String, required: true },
        places: [
            {
                type: Mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "PlaceSchema",
            },
        ],
    },
    { collection: "users" }
);

userSchema.plugin(UniqueValidator);

export default Mongoose.model<User>("UserSchema", userSchema);
