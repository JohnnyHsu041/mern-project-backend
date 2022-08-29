import { Router } from "express";

import {
    getAllUsers,
    createUserAndLogUserIn,
    userLogin,
} from "../controllers/users-controllers";

const router = Router();

router.get("/", getAllUsers);

router.post("/signup", createUserAndLogUserIn);

router.post("/login", userLogin);

export default router;
