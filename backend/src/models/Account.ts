import mongoose, { Document, Schema } from 'mongoose';

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT = 'credit'
}

export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true
    },
    accountType: {
      type: String,
      enum: Object.values(AccountType),
      required: true
    },
    balance: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IAccount>('Account', accountSchema);