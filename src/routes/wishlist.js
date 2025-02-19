const express = require('express');
const authentication = require('../Middlewares/auth');
const {
  addToWishListHandler,
  fetchWishlistProducts,
  deleteProductFromWishList,
} = require('../controllers/wishlist');

const wishlistRouter = express.Router();
//========================================ADD PRODUCT TO THE CART==================

wishlistRouter.patch(
  '/wishlist/add-product/:productId',
  authentication,
  addToWishListHandler
);
//========================================FETCH ALL THE CARTED PRODUCTS OF THE CURRENT USER==================

wishlistRouter.get(
  '/wislist/getproducts',
  authentication,
  fetchWishlistProducts
);

//========================================DELETE THE PRODUCT FROM THE USER CART==================

wishlistRouter.patch(
  '/wishlist/delete-Product/:productId',
  authentication,
  deleteProductFromWishList
);

module.exports = wishlistRouter;
