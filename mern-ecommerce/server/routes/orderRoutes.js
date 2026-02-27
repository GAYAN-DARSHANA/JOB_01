import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';

const router = express.Router();


// Calculate courier charge based on zone
const calculateCourierCharge = (zone, totalAmount) => {
  const baseCharges = {
    urban: 50,
    suburban: 100,
    rural: 150
  };
  
  // Free shipping for orders over $500
  if (totalAmount >= 500) return 0;
  
  return baseCharges[zone] || 50;
};

// POST /api/orders - Create new order with courier charge
router.post('/', protect, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;
    
    const courierCharge = calculateCourierCharge(shippingAddress.zone, totalAmount);
    const finalAmount = totalAmount + courierCharge;

    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      courierCharge,
      finalAmount,
      shippingAddress,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      status: 'pending'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/myorders - Get logged in user orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders/:id/return - Request return with photos
router.post('/:id/return', protect, async (req, res) => {
  try {
    const { returnReason, returnPhotos } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }

    // Check if within 7 days of delivery
    const deliveryDate = new Date(order.updatedAt);
    const now = new Date();
    const daysDiff = Math.floor((now - deliveryDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 7) {
      return res.status(400).json({ message: 'Return window expired (7 days)' });
    }

    order.status = 'return_requested';
    order.returnReason = returnReason;
    order.returnPhotos = returnPhotos || [];
    order.returnRequestedAt = new Date();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/zones - Get courier charges info
router.get('/zones', (req, res) => {
  res.json({
    urban: { charge: 50, name: 'City Center', freeShippingAbove: 500 },
    suburban: { charge: 100, name: 'Suburbs', freeShippingAbove: 500 },
    rural: { charge: 150, name: 'Remote Areas', freeShippingAbove: 500 }
  });
});


export default router;