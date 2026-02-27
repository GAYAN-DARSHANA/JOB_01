import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

const router = express.Router();

// IMPORTANT: Place this BEFORE the /:id route to avoid conflicts
// GET /api/reviews/check/:orderId/:productId - Check if user has reviewed
router.get('/check/:orderId/:productId', protect, async (req, res) => {
  try {
    console.log('Checking review for order:', req.params.orderId, 'product:', req.params.productId);
    console.log('User:', req.user._id);
    
    const review = await Review.findOne({
      orderId: req.params.orderId,
      productId: req.params.productId,
      userId: req.user._id
    });
    
    console.log('Found review:', review);
    
    res.json({ 
      hasReviewed: !!review, 
      review: review,
      canReview: true 
    });
  } catch (error) {
    console.error('Error in check review:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reviews/product/:productId - Get approved reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    console.log('Fetching reviews for product:', req.params.productId);
    
    const reviews = await Review.find({ 
      productId: req.params.productId,
      status: 'approved'
    })
    .sort({ createdAt: -1 })
    .limit(50);

    // Calculate average rating
    const stats = await Review.aggregate([
      { 
        $match: { 
          productId: req.params.productId,
          status: 'approved'
        } 
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const result = {
      reviews,
      averageRating: stats[0]?.averageRating?.toFixed(1) || 0,
      totalReviews: stats[0]?.totalReviews || 0
    };
    
    console.log('Product reviews result:', result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/reviews - Submit a review (customer)
router.post('/', protect, async (req, res) => {
  try {
    console.log('Submitting review:', req.body);
    console.log('User:', req.user._id);
    
    const { orderId, productId, rating, title, comment, photos, recommend } = req.body;
    
    // Verify order exists and belongs to user
    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user._id,
      status: 'delivered'
    });

    if (!order) {
      console.log('Order not found or not delivered');
      return res.status(404).json({ message: 'Order not found or not delivered' });
    }

    // Check if product exists in order
    const orderItem = order.items.find(item => {
      const itemProductId = item.product?._id?.toString() || item.product?.toString() || item.productId;
      return itemProductId === productId;
    });
    
    if (!orderItem) {
      console.log('Product not found in order');
      return res.status(400).json({ message: 'Product not found in this order' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ 
      orderId, 
      productId, 
      userId: req.user._id 
    });

    if (existingReview) {
      console.log('Already reviewed');
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Create review
    const review = new Review({
      orderId,
      productId,
      userId: req.user._id,
      userName: req.user.name,
      rating,
      title: title || '',
      comment,
      photos: photos || [],
      recommend: recommend !== undefined ? recommend : true,
      status: 'pending', // Requires admin approval
      createdAt: new Date()
    });

    await review.save();
    console.log('Review created:', review._id);
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reviews - Get all reviews (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status, productId, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (productId) query.productId = productId;

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);
    
    // Get stats
    const stats = await Review.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      stats: stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reviews/stats/overview - Get review statistics (admin)
router.get('/stats/overview', protect, admin, async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    const pendingReviews = await Review.countDocuments({ status: 'pending' });
    const approvedReviews = await Review.countDocuments({ status: 'approved' });
    const rejectedReviews = await Review.countDocuments({ status: 'rejected' });

    const avgRating = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);

    res.json({
      totalReviews,
      pendingReviews,
      approvedReviews,
      rejectedReviews,
      averageRating: avgRating[0]?.avg?.toFixed(1) || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/reviews/:id/status - Update review status (admin)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/reviews/:id - Delete review (admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to reviewRoutes.js temporarily
router.get('/test', (req, res) => {
  res.json({ message: 'Review API is working', timestamp: new Date() });
});

// GET /api/reviews/my-reviews - Get current user's reviews
router.get('/my-reviews', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;