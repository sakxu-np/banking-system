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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getLoanById = exports.getUserLoans = exports.applyForLoan = void 0;
const express_validator_1 = require("express-validator");
const Loan_1 = __importStar(require("../models/Loan"));
const Account_1 = __importDefault(require("../models/Account"));
const loanApproval_1 = require("../ai/loanApproval");
const applyForLoan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { accountId, loanType, amount, term, purpose, creditScore } = req.body;
        // Check if account exists and belongs to the user
        const account = yield Account_1.default.findOne({
            _id: accountId,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId
        });
        if (!account) {
            return res.status(404).json({ message: 'Account not found or access denied' });
        }
        // Calculate monthly payment (simple formula)
        // In a real app, we would use a more sophisticated calculation
        const interestRate = 0.05; // 5% initial rate
        const monthlyInterest = interestRate / 12;
        const monthlyPayment = (amount * monthlyInterest * Math.pow(1 + monthlyInterest, term)) /
            (Math.pow(1 + monthlyInterest, term) - 1);
        // Create loan application
        const loan = new Loan_1.default({
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId,
            accountId,
            loanType,
            amount,
            interestRate,
            term,
            monthlyPayment,
            status: Loan_1.LoanStatus.PENDING,
            purpose,
            creditScore
        });
        // Evaluate loan application
        const approvalResult = yield (0, loanApproval_1.evaluateLoanApplication)(loan);
        // Update loan with approval decision
        if (approvalResult.approved) {
            loan.status = Loan_1.LoanStatus.APPROVED;
            loan.approvalScore = approvalResult.score;
            loan.interestRate = approvalResult.suggestedInterestRate || loan.interestRate;
            // Recalculate monthly payment with approved interest rate
            const approvedMonthlyInterest = loan.interestRate / 12;
            loan.monthlyPayment = (amount * approvedMonthlyInterest * Math.pow(1 + approvedMonthlyInterest, term)) /
                (Math.pow(1 + approvedMonthlyInterest, term) - 1);
        }
        else {
            loan.status = Loan_1.LoanStatus.REJECTED;
            loan.approvalScore = approvalResult.score;
        }
        yield loan.save();
        res.status(201).json({
            message: 'Loan application processed',
            loan,
            approvalResult
        });
    }
    catch (error) {
        console.error('Loan application error:', error);
        res.status(500).json({ message: 'Server error processing loan application' });
    }
});
exports.applyForLoan = applyForLoan;
const getUserLoans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const loans = yield Loan_1.default.find({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId })
            .sort({ createdAt: -1 });
        res.json(loans);
    }
    catch (error) {
        console.error('Get loans error:', error);
        res.status(500).json({ message: 'Server error fetching loans' });
    }
});
exports.getUserLoans = getUserLoans;
const getLoanById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { loanId } = req.params;
        const loan = yield Loan_1.default.findOne({
            _id: loanId,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId
        });
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found or access denied' });
        }
        res.json(loan);
    }
    catch (error) {
        console.error('Get loan error:', error);
        res.status(500).json({ message: 'Server error fetching loan details' });
    }
});
exports.getLoanById = getLoanById;
