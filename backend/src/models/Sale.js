import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    productNameSnapshot: {
      type: String,
      required: true
    },

    unitPriceSnapshot: {
      type: Number,
      required: true,
      min: 0
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    lineTotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    _id: false
  }
);

const saleSchema = new mongoose.Schema(
  {
    saleNumber: {
      type: String,
      required: true,
      unique: true
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
    },

    items: {
      type: [saleItemSchema],
      required: true,
      validate: v => v.length > 0
    },

    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'transfer'],
      required: true
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    total: {
      type: Number,
      required: true,
      min: 0
    },

    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Sale', saleSchema);
