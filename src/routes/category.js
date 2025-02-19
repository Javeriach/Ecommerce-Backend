const express = require('express');
const categoryRouter = express.Router();
const authentication = require('../Middlewares/auth');
const cloudinary = require('../lib/cloudinary');
const CategorySchema = require('../models/category');
const multer = require('multer');
const Product = require('../models/product');
// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory as buffers
const mongoose = require('mongoose');
// Add category endpoint
categoryRouter.post(
  '/category/add',
  upload.single('imageurl'), // Handle single file upload
  async (req, res) => {
    const { name, backgroundColor } = req.body;
    const imageFile = req.file; // Access uploaded file

    console.log('Name:', name);
    console.log('Background Color:', backgroundColor);
    console.log('Image File:', imageFile);

    try {
      // Validate required fields
      if (!name || !backgroundColor || !imageFile) {
        return res.status(400).json({ error: 'Invalid data' });
      }

      // Upload image to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(
        `data:${imageFile.mimetype};base64,${imageFile.buffer.toString(
          'base64'
        )}`, // Convert buffer to base64
        {
          folder: 'categories', // Optional: Specify a folder in Cloudinary
        }
      );

      // Save category to the database
      const category = new CategorySchema({
        name,
        backgroundColor,
        imageurl: cloudinaryResponse.secure_url, // Save Cloudinary URL
      });

      await category.save();

      res.json({
        message: 'Category added successfully',
        categories: category, // Return the saved category
      });
    } catch (error) {
      console.error('Error adding category:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

categoryRouter.get('/categories', async (req, res) => {
  try {
    const categories = await CategorySchema.find();

    res.status(200).json({
      categories,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Ensure mongoose is imported if using ObjectId validation

categoryRouter.get('/category-products/:categoryId', async (req, res) => {
  try {
    let { categoryId } = req.params;

    // Validate categoryId
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID!' });
    }

    // Find products by categoryId and populate the category field
    const products = await Product.find({ category: categoryId }).populate(
      'category'
    );

    // Check if products were found
    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: 'No products found for this category.' });
    }

    // Return the products
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching category products:', error); // Log the error for debugging
    res.status(500).json({ message: error.message });
  }
});

module.exports = categoryRouter;
