import mongoose from 'mongoose';

const ProductSchema = mongoose.Schema({
  productName: { type: String, required: true },
  productPrice: { type: String, required: true },
  image: String,
  description: String,
  createdAt: String,
  brand: String,
  quantity: String,
});

export default mongoose.model('Product', ProductSchema);
