const express = require('express');
require('dotenv').config();

const connectDB = require('./src/config/database');
const app = express(); //EXPRESS INSTANCE TO LISTEN THE INCOMING CALLS
const authRouter = require('./src/routes/auth');
const categoryRouter = require('./src/routes/category');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const productsRoute = require('./src/routes/products');
const cartRouter = require('./src/routes/cart');
const wishlistRouter = require('./src/routes/wishlist');
const orderRouter = require('./src/routes/order');

console.log(process.env.CLOUDNARY_API_KEY);

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use('/', authRouter);
app.use('/', categoryRouter);
app.use('/', productsRoute);
app.use('/', cartRouter);
app.use('/', wishlistRouter);
app.use('/', orderRouter);

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Path not found!!' });
});

// CONNECT THE DATABASE FIRST AND THEN START THE SERVER
connectDB()
  .then(() => {
    console.log('Database Connected');
    app.listen(7777, () => {
      console.log('Server start listening');
    });
  })
  .catch((error) => {
    console.log(error);
  });
