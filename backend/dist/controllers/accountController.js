"use strict";
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
exports.createAccount = exports.getAccountById = exports.getAccounts = void 0;
const Account_1 = __importDefault(require("../models/Account"));
const mongoose_1 = __importDefault(require("mongoose"));
// Get all accounts for the authenticated user
const getAccounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // req.user is set by the auth middleware
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const accounts = yield Account_1.default.find({ userId: new mongoose_1.default.Types.ObjectId(userId) });
        res.status(200).json(accounts);
    }
    catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ message: 'Server error while fetching accounts', error: error.message });
    }
});
exports.getAccounts = getAccounts;
// Get a single account by ID
const getAccountById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const accountId = req.params.id;
        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(accountId)) {
            res.status(400).json({ message: 'Invalid account ID format' });
            return;
        }
        const account = yield Account_1.default.findOne({
            _id: accountId,
            userId: new mongoose_1.default.Types.ObjectId(userId)
        });
        if (!account) {
            res.status(404).json({ message: 'Account not found' });
            return;
        }
        res.status(200).json(account);
    }
    catch (error) {
        console.error('Error fetching account:', error);
        res.status(500).json({ message: 'Server error while fetching account', error: error.message });
    }
});
exports.getAccountById = getAccountById;
// Create a new account
const createAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { accountType, currency, initialBalance = 0 } = req.body;
        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        // Generate a random account number
        const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const newAccount = new Account_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            accountNumber,
            accountType,
            balance: initialBalance,
            currency: currency || 'USD'
        });
        yield newAccount.save();
        res.status(201).json(newAccount);
    }
    catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ message: 'Server error while creating account', error: error.message });
    }
});
exports.createAccount = createAccount;
