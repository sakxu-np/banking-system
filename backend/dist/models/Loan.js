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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanType = exports.LoanStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var LoanStatus;
(function (LoanStatus) {
    LoanStatus["PENDING"] = "pending";
    LoanStatus["APPROVED"] = "approved";
    LoanStatus["REJECTED"] = "rejected";
    LoanStatus["ACTIVE"] = "active";
    LoanStatus["COMPLETED"] = "completed";
    LoanStatus["DEFAULTED"] = "defaulted";
})(LoanStatus || (exports.LoanStatus = LoanStatus = {}));
var LoanType;
(function (LoanType) {
    LoanType["PERSONAL"] = "personal";
    LoanType["HOME"] = "home";
    LoanType["AUTO"] = "auto";
    LoanType["EDUCATION"] = "education";
    LoanType["BUSINESS"] = "business";
})(LoanType || (exports.LoanType = LoanType = {}));
const loanSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accountId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    loanType: {
        type: String,
        enum: Object.values(LoanType),
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    interestRate: {
        type: Number,
        required: true
    },
    term: {
        type: Number,
        required: true
    },
    monthlyPayment: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    status: {
        type: String,
        enum: Object.values(LoanStatus),
        default: LoanStatus.PENDING
    },
    purpose: {
        type: String,
        required: true
    },
    creditScore: {
        type: Number,
        required: true
    },
    approvalScore: {
        type: Number
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Loan', loanSchema);
