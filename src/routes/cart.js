const express = require('express');
const authentication = require('../Middlewares/auth');
const {
  addToCartHandler,
  fetchCartedProducts,
  deleteProductFromCart,
  cartedProductQuantityHandler,
  carted_Product_Selected_Status_Handler,
} = require('../controllers/cart');

const cartRouter = express.Router();
//========================================ADD PRODUCT TO THE CART==================

cartRouter.post(
  '/cart/add-product/:productId',
  authentication,
  addToCartHandler
);
//========================================FETCH ALL THE CARTED PRODUCTS OF THE CURRENT USER==================

cartRouter.get('/cart/getproducts', authentication, fetchCartedProducts);

//========================================DELETE THE PRODUCT FROM THE USER CART==================

cartRouter.patch(
  '/cart/delete-Product/:productId',
  authentication,
  deleteProductFromCart
);

//========================================UPDATE THE PRODUCT QUANTITY==================
cartRouter.patch(
  '/cart/update-quantity/:productId',
  authentication,
  cartedProductQuantityHandler
);

//========================================UPDATE THE STATUS EITHER SELECTED TO BUY OR NOT==================
cartRouter.patch(
  '/cart/update-selected-to-purchase/:productId',
  authentication,
  carted_Product_Selected_Status_Handler
);
module.exports = cartRouter;
