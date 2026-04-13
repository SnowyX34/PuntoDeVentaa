"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const register_controller_1 = require("../controllers/register.controller");
const validateUser_1 = require("../middleware/validateUser");
const router = (0, express_1.Router)();
router.post('/register', validateUser_1.validateCreateUser, register_controller_1.registerUser);
exports.default = router;
