import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  image: { type: String, default: '' },
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] // Linked products
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;