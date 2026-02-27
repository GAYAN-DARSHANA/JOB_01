import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/products - Get all products (Public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}).populate('relatedProducts', 'name price image');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id - Get single product with related (Public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('relatedProducts', 'name price image stock');
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id/related - Get related products
router.get('/:id/related', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If related products are set, return them
    if (product.relatedProducts && product.relatedProducts.length > 0) {
      const related = await Product.find({ 
        _id: { $in: product.relatedProducts } 
      }).select('name price image stock');
      return res.json(related);
    }

    // Otherwise, return same category products
    const related = await Product.find({ 
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4).select('name price image stock');
    
    res.json(related);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products - Create product (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// GET /api/products/featured - Get featured products with review stats
router.get('/featured', async (req, res) => {
  try {
    // Get active products, limit to 6
    const products = await Product.find({ isActive: true })
      .limit(6)
      .lean();

    // Get review stats for each product
    const productsWithStats = await Promise.all(
      products.map(async (product) => {
        const stats = await Review.aggregate([
          { 
            $match: { 
              productId: product._id.toString(),
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

        return {
          ...product,
          rating: stats[0]?.averageRating?.toFixed(1) || 0,
          reviewCount: stats[0]?.totalReviews || 0
        };
      })
    );

    // Sort by review count (highest first)
    productsWithStats.sort((a, b) => b.reviewCount - a.reviewCount);

    res.json({ products: productsWithStats });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price || product.price;
      product.category = req.body.category || product.category;
      product.stock = req.body.stock || product.stock;
      product.image = req.body.image || product.image;
      product.relatedProducts = req.body.relatedProducts || product.relatedProducts;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;