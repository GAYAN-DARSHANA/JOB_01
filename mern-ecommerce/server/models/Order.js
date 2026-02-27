import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  courierCharge: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true }, // total + courier
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
    zone: { type: String, enum: ['urban', 'suburban', 'rural'], default: 'urban' }
  },
  paymentMethod: { type: String, enum: ['cod', 'card'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'], default: 'pending' },
  returnPhotos: [String], // URLs to uploaded photos
  returnReason: String,
  returnRequestedAt: Date
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;