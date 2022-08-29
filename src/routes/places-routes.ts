import { Router } from "express";

import {
    createPlace,
    getPlace,
    getPlacesByUserId,
    updatePlace,
    deletePlace,
} from "../controllers/places-controllers";

const router = Router();

router.post("/", createPlace);

router.get("/:pid", getPlace);

router.get("/user/:uid", getPlacesByUserId);

router.patch("/:pid", updatePlace);

router.delete("/:pid", deletePlace);

export default router;
