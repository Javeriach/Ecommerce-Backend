const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to the Product model
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
});

const orderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    items: [orderItemSchema], // Array of order items
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address', // Reference to the Address model
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'], // Payment status options
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'], // Order status options
      default: 'Processing',
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'PayPal', 'Cash on Delivery'], // Payment method options
      required: true,
    },
    transactionId: {
      type: String, // Payment gateway transaction ID
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
