import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    product_name_snapshot: {
      type: String,
      required: true
    },

    unit_price_snapshot: {
      type: Number,
      required: true,
      min: 0
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    line_total: {
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
    sale_number: {
      type: String,
      required: true,
      unique: true
    },

    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
    },

    items: {
      type: [saleItemSchema],
      required: true,
      validate: v => v.length > 0
    },

    payment_method: {
      type: String,
      enum: ['cash', 'card', 'transfer'],
      required: true
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    discount_percent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    discount_amount: {
      type: Number,
      default: 0,
      min: 0
    },

    total: {
      type: Number,
      required: true,
      min: 0
    },

    sold_by: {
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