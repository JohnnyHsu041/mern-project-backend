"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLogin = exports.signup = exports.getAllUsers = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_error_1 = __importDefault(require("../models/http-error"));
const user_schema_1 = __importDefault(require("../models/user-schema"));
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let users;
    try {
        users = yield user_schema_1.default.find({}, "name email").exec();
    }
    catch (err) {
        return next(new http_error_1.default("Fetching users failed, please try again", 500));
    }
    if (!users || users.length === 0) {
        return next(new http_error_1.default("No user info", 404));
    }
    users = users.map((user) => user.toObject({ getters: true }));
    res.status(200).json({
        message: "Get user list",
        users,
    });
});
exports.getAllUsers = getAllUsers;
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        return next(new http_error_1.default("Invalid inputs passed, please enter again", 422));
    }
    const { name, email, password } = req.body;
    let existingUser;
    try {
        existingUser = yield user_schema_1.default.findOne({ email: email }).exec();
    }
    catch (err) {
        return next(new http_error_1.default("Fetching user info failed, please try again", 500));
    }
    if (existingUser) {
        return next(new http_error_1.default("The user already exists, please sign in instead", 422));
    }
    let hashedPassword;
    try {
        hashedPassword = yield bcryptjs_1.default.hash(password, 12);
    }
    catch (err) {
        return next(new http_error_1.default("Could not create user, please try again", 500));
    }
    const newUser = new user_schema_1.default({
        name,
        email,
        password: hashedPassword,
        image: "https://images.unsplash.com/photo-1604170099361-14f52e9f0c11?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2787&q=80",
        places: [],
    });
    try {
        yield newUser.save();
    }
    catch (err) {
        return next(new http_error_1.default("Could not update new user info, please try again", 500));
    }
    let token;
    try {
        token = jsonwebtoken_1.default.sign({ userId: newUser.id, email: newUser.email }, process.env.TOKEN_PRIVATE_KEY, { expiresIn: "1h" });
    }
    catch (err) {
        return next(new http_error_1.default("Could not sign up, please try again", 500));
    }
    res.status(201).json({
        message: "Registered the account!",
        userId: newUser.id,
        email: newUser,
        token: token,
    });
});
exports.signup = signup;
const userLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = yield user_schema_1.default.findOne({ email: email }).exec();
    }
    catch (err) {
        return next(new http_error_1.default("Logging in failed, please try again", 500));
    }
    if (!existingUser) {
        return next(new http_error_1.default("The user does not exist or the password is wrong, please try again", 422));
    }
    let isValidPassword = false;
    try {
        isValidPassword = yield bcryptjs_1.default.compare(password, existingUser.password);
    }
    catch (err) {
        return next(new http_error_1.default("Something wrong when logging in, please try again", 500));
    }
    if (!isValidPassword) {
        return next(new http_error_1.default("Invalid credential", 401));
    }
    existingUser = existingUser.toObject({ getters: true });
    let token;
    try {
        token = jsonwebtoken_1.default.sign({ userId: existingUser.id, email: existingUser.email }, process.env.TOKEN_PRIVATE_KEY, { expiresIn: "1h" });
    }
    catch (err) {
        return next(new http_error_1.default("Could not log you in, please try again", 500));
    }
    res.status(200).json({
        message: "Logged In",
        userId: existingUser.id,
        token,
    });
});
exports.userLogin = userLogin;
