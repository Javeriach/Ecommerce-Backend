const mongoose = require('mongoose');
let categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageurl: {
      type: String,
      required: true,
    },
    backgroundColor: {
      type: String,
      required: true,
    },
  },
  { Timestamp: true }
);

const CategorySchema = mongoose.model('Category', categorySchema);
module.exports = CategorySchema;
