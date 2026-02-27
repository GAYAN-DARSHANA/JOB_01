import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    default: ''
  },
  comment: {
    type: String,
    required: true
  },
  photos: [{
    type: String
  }],
  recommend: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate reviews
reviewSchema.index({ orderId: 1, productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, status: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;