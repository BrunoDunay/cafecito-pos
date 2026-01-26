import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: ''
    },
    
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
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

export default mongoose.model('Product', productSchema);
