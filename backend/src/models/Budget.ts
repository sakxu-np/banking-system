import mongoose, { Document, Schema } from 'mongoose';

export interface IBudgetCategory {
  name: string;
  limit: number;
  spent: number;
  color: string;
}

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  totalBudget: number;
  startDate: Date;
  endDate: Date;
  categories: IBudgetCategory[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const budgetCategorySchema = new Schema<IBudgetCategory>({
  name: {
    type: String,
    required: true
  },
  limit: {
    type: Number,
    required: true
  },
  spent: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#3498db'
  }
});

const budgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    totalBudget: {
      type: Number,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    categories: [budgetCategorySchema],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IBudget>('Budget', budgetSchema);