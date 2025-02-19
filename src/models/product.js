const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 30,
    },
    price: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      default: 'This product is vary famous',
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },

    images: {
      type: [String, 'Only String is allowed'],
    },
    discount: {
      type: Number,
    },
    rating: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
