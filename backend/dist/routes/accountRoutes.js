"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middleware/auth"));
const accountController_1 = require("../controllers/accountController");
const router = express_1.default.Router();
// Get all accounts for the authenticated user
router.get('/', auth_1.default, accountController_1.getAccounts);
// Get a specific account by ID
router.get('/:id', auth_1.default, accountController_1.getAccountById);
// Create a new account
router.post('/', auth_1.default, accountController_1.createAccount);
exports.default = router;
