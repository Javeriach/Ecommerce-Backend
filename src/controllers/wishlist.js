const WishedProduct = require('../models/whistlistProduct');

const fetchWishlistProducts = async (req, res) => {
  try {
    // Input validation
    if (!req?.body?.userData?._id) {
      return res
        .status(400)
        .json({ success: false, message: 'User ID is required' });
    }

    // Fetch wishlist products with nested population
    const products = await WishedProduct.find({
      user: req.body.userData._id,
    }).populate({
      path: 'wishedProducts.product',
      populate: { path: 'category' },
    });

    // Handle case where no wishlist exists
    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Send response
    res.status(200).json({
      success: true,
      data: products[0].wishedProducts,
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching wished products:', error);

    // Send error response
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addToWishListHandler = async (req, res) => {
  const { productId } = req.params; // Correctly access params
  const userId = req.body.userData._id; // Ensure userData is populated by your middleware

  try {
    // Find the user's wishlist or create a new one if it doesn't exist
    let wishlist = await WishedProduct.findOne({ user: userId });

    if (!wishlist) {
      // If no wishlist exists, create a new one
      wishlist = new WishedProduct({
        user: userId,
        wishedProducts: [], // Fixed field name
      });
    }

    // Check if the product already exists in the wishlist
    const productIndex = wishlist.wishedProducts.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex > -1) {
      await WishedProduct.updateOne(
        {
          user: req?.body?.userData?._id,
        },
        { $pull: { wishedProducts: { product: productId } } } // TO REMOVE THE PARTICULAR PRODUCT FROM THE LIST
      );

      return res
        .status(201)
        .json({ message: 'Product removed From Whistlist' });
    } else {
      wishlist.wishedProducts.push({ product: productId });
    }

    // Save the updated wishlist
    await wishlist.save(); // Fixed variable name

    const products = await WishedProduct.findOne({
      user: req.body.userData._id,
    }).populate({
      path: 'wishedProducts.product',
      populate: { path: 'category' },
    });

    console.log(products);
    // Send a success response
    res.status(200).json({
      message: 'Product added to wishlist successfully', // Fixed message
      wishlist: products.wishedProducts,
    });
  } catch (error) {
    console.error('Error adding product to wishlist:', error);
    res.status(500).json({ message: error.message });
  }
};

//======================================= Delete the specific product from Wishlist ==================
const deleteProductFromWishList = async (req, res) => {
  let { productId } = req.params;
  try {
    let updatedProduct = await WishedProduct.updateOne(
      {
        user: req?.body?.userData?._id,
      },
      { $pull: { wishedProducts: { product: productId } } } // TO REMOVE THE PARTICULAR PRODUCT FROM THE LIST
    );

    // Check if the product was actually deleted
    if (updatedProduct.modifiedCount === 0) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    return res.json({ message: 'Product deleted from wishlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  fetchWishlistProducts,
  deleteProductFromWishList,
  addToWishListHandler,
};
