const mongoose = require('mongoose');

const cartedProduct = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cartedProducts: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          required: true,
        },
        selectedForPurchase: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CartedProduct = mongoose.model('CartedProduct', cartedProduct);
module.exports = CartedProduct;
