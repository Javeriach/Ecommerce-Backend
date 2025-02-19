const Address = require('../models/address');

const createOrder = async (req, res) => {
  const {
    name,
    email,
    area,
    country,
    streetAddress,
    city,
    phoneNumber,
    postCode,
  } = req.body.address;
  const { products, userData } = req.body; // Ensure products and userData are included in the request body

  try {
    // Validate required fields
    if (
      !name ||
      !email ||
      !area ||
      !country ||
      !streetAddress ||
      !city ||
      !phoneNumber ||
      !postCode
    ) {
      return res
        .status(400)
        .json({ message: 'All address fields are required' });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({
          message: 'Products are required and must be a non-empty array',
        });
    }

    if (!userData || !userData._id) {
      return res.status(400).json({ message: 'User data is required' });
    }

    // Prepare line items for Stripe
    const line_items = products.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          images: [item.product.images[0]], // Ensure the product has at least one image
        },
        unit_amount: Math.round(item.product.price * 100), // Convert price to cents
      },
      quantity: item.quantity,
    }));

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url:
        'https://ecommerce-frontend-cd9r.vercel.app/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://ecommerce-frontend-cd9r.vercel.app/cancel',
    });

    // Save the address with the Stripe session ID as the order ID
    const newAddress = new Address({
      user: userData._id,
      name: name,
      phoneNumber: phoneNumber,
      email: email,
      address: streetAddress,
      city: city,
      postalCode: postCode,
      country: country,
      area: area,
      orderId: session.id, // Link the address to the Stripe session
    });

    const savedAddress = await newAddress.save();

    // Respond with the Stripe session ID
    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating order:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = { createOrder };
