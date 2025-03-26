const Address = require('../models/address');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const mongoose = require('mongoose');
const Order = require('../models/order');

const addAddress = async (req, res) => {
  // CHECK WHETHER THW BODY CONTAINS THE CORRECT DATA
  if (
    !req.body.country ||
    !req.body.city ||
    !req.body.streetAddress ||
    !req.body.area ||
    !req.body.postCode
  ) {
    res.status(500).json({ message: 'Invalid Data' });
  }

  // MAKE A NEW OBJECT OF THE ADDRESS
  let newAddress = {
    userId: req.body.userData._id,
    streetAddress: req.body.streetAddress,
    city: req.body.city,
    postalCode: req.body.postCode,
    country: req.body.country,
    area: req.body.area,
  };

  try {
    let address = new Address(newAddress);
    address.save();
    res.json({
      message: 'Address saved Sucessfully !',
      address,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addressList = async (req, res) => {
  try {
    let address = await Address.find({ userId: req?.body?.userData._id });
    res.json({
      addressList: address,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkout = async (req, res) => {
  try {
    const { products, userData, shippingAddressId, paymentMethod } = req.body;

    // Create Stripe session
    const lineItems = products.map((item) => ({
      price_data: {
        currency: 'USD',
        product_data: {
          name: item.product.name,
          images: [item.product.images[0]],
        },
        unit_amount: item.product.price * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    // Generate a common order ID for all items in this transaction
    const commonOrderId = new mongoose.Types.ObjectId().toHexString();

    // Create array of order promises
    const orderPromises = products.map((item) =>
      new Order({
        orderId: commonOrderId,
        transactionId: session.id,
        user: req.body.userData._id,
        product: item.product._id,
        quantity: item.quantity,
        shippingAddress: req.body.address.addressId,
        paymentStatus: 'Pending',
        orderStatus: 'Processing',
        paymentMethod: 'Credit Card',
      }).save()
    );

    // Save all orders simultaneously
    await Promise.all(orderPromises);

    res.json({
      id: session.id,
      orderId: commonOrderId,
    });
  } catch (error) {
    console.error('Checkout Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to process checkout',
    });
  }
};

let webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.WERHOOK_SIGNING_SECREAT; // Your webhook signing secret

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Retrieve the full session object
      const stripeSession = await stripe.checkout.sessions.retrieve(
        session.id,
        {
          expand: ['payment_intent'],
        }
      );

      // Update all orders with this transaction ID
      const updatedOrders = await Order.updateMany(
        { transactionId: stripeSession.id },
        {
          $set: {
            paymentStatus:
              stripeSession.payment_status === 'paid' ? 'Paid' : 'Failed',
            orderStatus: 'Processing',
            // Add any other fields you want to update
          },
        }
      );

      console.log(
        `Updated ${updatedOrders.modifiedCount} orders for transaction ${stripeSession.id}`
      );
    } catch (dbError) {
      console.error('Error updating orders:', dbError);
      return res.status(500).json({ error: 'Failed to update orders' });
    }
  }

  res.status(200).json({ received: true });
};
module.exports = { addressList, addAddress, checkout, webhookHandler };
