let express = require('express');
const authentication = require('../Middlewares/auth');
const {
  addProducts,
  fetchProducts,
  deleteProduct,
  updateProducts,
  getSingleProductDetail,
} = require('../controllers/products');
let productsRoute = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory as buffers

productsRoute.post(
  '/add-product',
  authentication,
  upload.array('images', 3),
  addProducts
);

productsRoute.get('/fetch-product', fetchProducts);
productsRoute.post('/delete-product/:productId', authentication, deleteProduct);
productsRoute.patch('/update-product', authentication, updateProducts);
productsRoute.get('/product-detail/:productId', getSingleProductDetail);

module.exports = productsRoute;
