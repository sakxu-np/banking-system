"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// Define your budget routes here
router.get('/', auth_1.default, (req, res) => {
    res.status(200).json({ message: 'Budget routes' });
});
exports.default = router;
