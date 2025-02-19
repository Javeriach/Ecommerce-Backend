const mongoose = require('mongoose');

const wishedProduct = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    wishedProducts: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const WishedProduct = mongoose.model('WishedProduct', wishedProduct);
module.exports = WishedProduct;
