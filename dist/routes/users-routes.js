"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const file_upload_1 = __importDefault(require("../middleware/file-upload"));
const users_controllers_1 = require("../controllers/users-controllers");
const router = (0, express_1.Router)();
router.get("/", users_controllers_1.getAllUsers);
router.post("/signup", file_upload_1.default.single("image"), [
    (0, express_validator_1.check)("name").not().isEmpty(),
    (0, express_validator_1.check)("email").normalizeEmail().isEmail(),
    (0, express_validator_1.check)("password").isLength({ min: 6 }),
], users_controllers_1.signup);
router.post("/login", users_controllers_1.userLogin);
exports.default = router;
