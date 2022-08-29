import { Router } from "express";
import { check } from "express-validator";

import {
    createPlace,
    getPlace,
    getPlacesByUserId,
    updatePlace,
    deletePlace,
} from "../controllers/places-controllers";

const router = Router();

router.post(
    "/",
    [
        check("title").not().isEmpty(),
        check("description").isLength({ min: 5 }),
        check("address").not().isEmpty(),
    ],
    createPlace
);

router.get("/:pid", getPlace);

router.get("/user/:uid", getPlacesByUserId);

router.patch(
    "/:pid",
    [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
    updatePlace
);

router.delete("/:pid", deletePlace);

export default router;
