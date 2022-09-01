import { Router } from "express";
import { check } from "express-validator";

import {
    getAllUsers,
    signup,
    userLogin,
} from "../controllers/users-controllers";

const router = Router();

router.get("/", getAllUsers);

router.post(
    "/signup",
    [
        check("name").not().isEmpty(),
        check("email").normalizeEmail().isEmail(), // normailizeEmail: Test123@gggg.com =>test123@gggg.com
        check("password").isLength({ min: 6 }),
    ],
    signup
);

router.post("/login", userLogin);

export default router;
