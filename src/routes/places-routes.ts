import { Router } from "express";
import { check } from "express-validator";

import {
    createPlace,
    getPlace,
    getPlacesByUserId,
    updatePlace,
    deletePlace,
} from "../controllers/places-controllers";
import authCheck from "../middleware/auth-check";

const router = Router();

router.get("/:pid", getPlace);

router.get("/user/:uid", getPlacesByUserId);

router.use(authCheck);

router.post(
    "/",
    [
        check("title").not().isEmpty(),
        check("description").isLength({ min: 5 }),
        check("address").not().isEmpty(),
    ],
    createPlace
);

router.patch(
    "/:pid",
    [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
    updatePlace
);

router.delete("/:pid", deletePlace);

export default router;
