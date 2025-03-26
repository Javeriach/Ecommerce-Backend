const express = require('express');
let orderRouter = express.Router();
const authentication = require('../Middlewares/auth');
const {
  addAddress,
  addressList,
  checkout,
  webhookHandler,
} = require('../controllers/order');

orderRouter.get('/allAddress', authentication, addressList);
orderRouter.post('/addAddress', authentication, addAddress);
orderRouter.post('/checkout', authentication, checkout);
orderRouter.post(
  '/stripe-webhook',
  express.raw({ type: 'application/json' }),
  webhookHandler
);
module.exports = orderRouter;
