import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    phoneOrEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    purchasesCount: {
      type: Number,
      default: 0,
      min: 0
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

export default mongoose.model('Customer', customerSchema);
