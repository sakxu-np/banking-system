import mongoose, { Document, Schema } from 'mongoose';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
  LOAN_DISBURSEMENT = 'loan_disbursement',
  LOAN_PAYMENT = 'loan_payment',
  INVESTMENT = 'investment'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  FLAGGED = 'flagged'
}

export interface ITransaction extends Document {
  accountId: mongoose.Types.ObjectId;
  receiverAccountId?: mongoose.Types.ObjectId;
  transactionType: TransactionType;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  status: TransactionStatus;
  fraudScore?: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true
    },
    receiverAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account'
    },
    transactionType: {
      type: String,
      enum: Object.values(TransactionType),
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    description: {
      type: String,
      required: true
    },
    reference: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING
    },
    fraudScore: {
      type: Number,
      min: 0,
      max: 1
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ITransaction>('Transaction', transactionSchema);