const cloudinary = require('../lib/cloudinary');
const Product = require('../models/product');
const multer = require('multer');

// Add product endpoint
const addProducts = async (req, res) => {
  const { name, description, price, category } = req.body;
  const images = req.files; // Access uploaded files

  try {
    // Validate required fields
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !images ||
      images.length === 0
    ) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    // Limit the number of images to 3
    if (images.length > 3) {
      return res.status(400).json({ error: 'Maximum 3 images allowed' });
    }

    // Upload images to Cloudinary
    const savedImages = await Promise.all(
      images.map((image) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto', folder: 'products' }, // Optional: Specify a folder in Cloudinary
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result.secure_url); // Return the secure URL of the uploaded image
              }
            }
          );

          // Upload file buffer directly to Cloudinary
          uploadStream.end(image.buffer);
        });
      })
    );

    // Save product details to the database
    console.log(description);
    let product = new Product({
      name,
      description: description,
      images: savedImages, // Save Cloudinary URLs
      price,
      category,
    });

    await product.save();
    product = await Product.findOne(product._id).populate('category', ['name']);

    res.json({
      message: 'Product added successfully',
      product,
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: error.message });
  }
};
const fetchProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category', ['name']);
    res.status(200).json({
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  const { productId } = req.params; // Assuming the product ID is passed as a URL parameter

  try {
    // Step 1: Find the product in the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Step 2: Delete images from Cloudinary
    const deleteImagePromises = product.images.map((imageUrl) => {
      // Extract the public ID from the Cloudinary URL
      const publicId = imageUrl.split('/').pop().split('.')[0]; // Example: Extract "products/abc123" from the URL

      return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    });

    // Wait for all images to be deleted from Cloudinary
    await Promise.all(deleteImagePromises);

    // Step 3: Delete the product from the database
    await Product.findByIdAndDelete(productId);

    res.json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateProducts = async (req, res) => {
  const { name, description, price, category, discount, _id } = req.body;

  try {
    // Validate required fields
    if (!name || !description || !price || !category || !_id || !discount) {
      return res.status(400).json({ message: 'Invalid Updates' });
    }

    // Update the product in the database
    const updatedProduct = await Product.findOneAndUpdate(
      { _id }, // Find the product by ID
      { name, description, price, category, discount }, // Fields to update
      { new: true } // Return the updated document
    ).populate({ path: 'category' });

    console.log(updatedProduct);
    // Check if the product was found and updated
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Send the response with the updated product
    res.json({
      message: 'Product Updated Successfully!',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const getSingleProductDetail = async (req, res) => {
  const { productId } = req.params; // Assuming the product ID is passed as a URL parameter

  try {
    // Step 1: Find the product in the database
    const product = await Product.findById(productId).populate({
      path: 'category',
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Step 2: Find related products in the same category
    const relatedProducts = await Product.find({
      category: product.category, // Filter by the same category
      _id: { $ne: productId }, // Exclude the current product
    })
      .limit(4) // Limit to 4 related products
      .exec();

    // Step 3: Include the current product in the related products list (if needed)

    // Step 4: Return the response
    res.json({
      product,
      relatedProducts,
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addProducts,
  fetchProducts,
  deleteProduct,
  updateProducts,
  getSingleProductDetail,
};
