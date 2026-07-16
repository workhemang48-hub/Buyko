import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: [{
        type: String,
        enum: ['Men', 'Women'],
      }],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one category is required',
      },
    },
    subCategory: {
      type: String,
      enum: ['Topwear', 'Bottomwear', 'Winterwear'],
      required: true,
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sizes: [
      {
        size: {
          type: String,
          required: true,
        },
        stock: {
          type: Number,
          required: true,
          default: 0,
          min: 0,
        },
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;