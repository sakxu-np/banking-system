import mongoose, { Document, Schema } from 'mongoose';

export enum LoanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted'
}

export enum LoanType {
  PERSONAL = 'personal',
  HOME = 'home',
  AUTO = 'auto',
  EDUCATION = 'education',
  BUSINESS = 'business'
}

export interface ILoan extends Document {
  userId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  loanType: LoanType;
  amount: number;
  interestRate: number;
  term: number; // in months
  monthlyPayment: number;
  startDate?: Date;
  endDate?: Date;
  status: LoanStatus;
  purpose: string;
  creditScore: number;
  approvalScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    accountId: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ILoan>('Loan', loanSchema);