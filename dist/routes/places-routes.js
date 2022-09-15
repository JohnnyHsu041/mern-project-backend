"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const places_controllers_1 = require("../controllers/places-controllers");
const auth_check_1 = __importDefault(require("../middleware/auth-check"));
const router = (0, express_1.Router)();
router.get("/:pid", places_controllers_1.getPlace);
router.get("/user/:uid", places_controllers_1.getPlacesByUserId);
router.use(auth_check_1.default);
router.post("/", [
    (0, express_validator_1.check)("title").not().isEmpty(),
    (0, express_validator_1.check)("description").isLength({ min: 5 }),
    (0, express_validator_1.check)("address").not().isEmpty(),
], places_controllers_1.createPlace);
router.patch("/:pid", [(0, express_validator_1.check)("title").not().isEmpty(), (0, express_validator_1.check)("description").isLength({ min: 5 })], places_controllers_1.updatePlace);
router.delete("/:pid", places_controllers_1.deletePlace);
exports.default = router;
