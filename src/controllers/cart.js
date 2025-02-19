const CartedProduct = require('../models/cartedProduct');

//========================================FETCH ALL THE CARTED PRODUCTS==================
const fetchCartedProducts = async (req, res) => {
  try {
    // Input validation
    if (!req?.body?.userData?._id) {
      return res
        .status(400)
        .json({ success: false, message: 'User ID is required' });
    }

    // Fetch carted products with nested population
    const products = await CartedProduct.find({
      user: req.body.userData._id,
    }).populate({
      path: 'cartedProducts.product',
      populate: { path: 'category' },
    });

    // Send response
    res.status(200).json({
      success: true,
      data: products[0].cartedProducts,
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching carted products:', error);

    // Send error response
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const addToCartHandler = async (req, res) => {
  const { productId } = req.params; // Correctly access params
  const userId = req.body.userData._id; // Ensure userData is populated by your middleware

  try {
    // Find the user's cart or create a new one if it doesn't exist
    let cart = await CartedProduct.findOne({ user: userId });

    if (!cart) {
      // If no cart exists, create a new one
      cart = new CartedProduct({
        user: userId,
        cartedProducts: [],
      });
    }

    // Check if the product already exists in the cart
    const productIndex = cart.cartedProducts.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex > -1) {
      // If the product exists, increment the quantity
      //   cart.cartedProducts[productIndex].quantity += 1;
      return res
        .status(201)
        .json({ message: 'Product Already exist in Cart!!' });
    } else {
      // If the product doesn't exist, add it to the cart
      cart.cartedProducts.push({ product: productId, quantity: 1 });
    }

    // Save the updated cart
    await cart.save();

    const products = await CartedProduct.findOne({
      user: req.body.userData._id,
    }).populate({
      path: 'cartedProducts.product',
      populate: { path: 'category' },
    });

    console.log(products);
    // Send a success response
    res.status(200).json({
      message: 'Product added to cart successfully',
      cart: products.cartedProducts,
    });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ message: error.message });
  }
};
//======================================= Delete the specific product from Cart==================
const deleteProductFromCart = async (req, res) => {
  let { productId } = req.params;
  try {
    let updatedProduct = await CartedProduct.updateOne(
      {
        user: req?.body?.userData?._id,
      },
      { $pull: { cartedProducts: { product: productId } } } /// TO REMOVE THE PARTICULAR PRODUCT FROM THE LIST
    );

    if (!updatedProduct)
      return res.status(500).json({ message: 'Product not found' });
    return res.json({ message: 'Product deleted from Cart' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//========================================UPDATE THE QUANTITY=============================
const cartedProductQuantityHandler = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.query; // Correctly access params
  const userId = req.body.userData._id; // Ensure userData is populated by your middleware

  try {
    if (Number(quantity) < 1)
      return res.status(500).json({ message: 'Invalid data not allowed!' });
    // Find the user's cart or create a new one if it doesn't exist
    let cart = await CartedProduct.findOne({ user: userId });

    // Check if the product already exists in the cart
    const productIndex = cart.cartedProducts.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex > -1) {
      // If the product exists, increment the quantity
      cart.cartedProducts[productIndex].quantity = Number(quantity);
      await cart.save();
      return res
        .status(200)
        .json({ message: 'Product Quantity Updated Successfully!!' });
    }

    res.status(500).json({
      message: 'Product not found!',
    });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ message: error.message });
  }
};
//========================================UPDATE THE STATUS EITHER SELECTED TO BUY OR NOT==================
const carted_Product_Selected_Status_Handler = async (req, res) => {
  const { productId } = req.params;
  const userId = req.body.userData._id; // Ensure userData is populated by your middleware

  try {
    // Find the user's cart or create a new one if it doesn't exist
    let cart = await CartedProduct.findOne({ user: userId });

    // Check if the product already exists in the cart
    const productIndex = cart.cartedProducts.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex > -1) {
      // If the product exists, increment the quantity
      cart.cartedProducts[productIndex].selectedForPurchase =
        !cart.cartedProducts[productIndex].selectedForPurchase;
      await cart.save();
      return res
        .status(200)
        .json({ message: 'Product Quantity Updated Successfully!!' });
    }

    res.status(500).json({
      message: 'Product not found!',
    });
  } catch (error) {
    console.error('Error Updating the selected to purchase :', error);
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  addToCartHandler,
  fetchCartedProducts,
  deleteProductFromCart,
  cartedProductQuantityHandler,
  carted_Product_Selected_Status_Handler,
};
