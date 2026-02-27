import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingBag, 
  ArrowRight, 
  Star, 
  Quote,
  User,
  TrendingUp,
  Clock,
  CheckCircle,
  Shield,
  Truck,
  RotateCcw,
  Loader2
} from 'lucide-react';

// Star Rating Display Component
const StarRating = ({ rating, size = 'sm' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizes[size]} ${
            star <= rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
};

// Product Card with Reviews
const FeaturedProduct = ({ product }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductReviews();
  }, [product._id]);

  const fetchProductReviews = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5001/api/reviews/product/${product._id}`);
      setReviews(data.reviews.slice(0, 2));
      setStats({
        averageRating: data.averageRating,
        totalReviews: data.totalReviews
      });
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group">
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {stats.totalReviews > 0 && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <div>
              <p className="font-bold text-slate-800 leading-none">{stats.averageRating}</p>
              <p className="text-xs text-slate-500">{stats.totalReviews} reviews</p>
            </div>
          </div>
        )}

        {product.discount > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{product.discount}%
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-bold text-xl text-slate-800 mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>

        {stats.totalReviews > 0 ? (
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={Math.round(stats.averageRating)} size="md" />
            <span className="text-sm text-slate-600 font-medium">
              {stats.averageRating} ({stats.totalReviews} reviews)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm">
            <Star className="w-4 h-4" />
            <span>No reviews yet</span>
          </div>
        )}

        {reviews.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Reviews</p>
            {reviews.map((review, idx) => (
              <div key={idx} className="bg-slate-50 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span className="font-medium text-slate-700">{review.userName}</span>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <p className="text-slate-600 line-clamp-2">"{review.comment}"</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <p className="text-2xl font-bold text-indigo-600">${product.price}</p>
            {product.originalPrice && (
              <p className="text-sm text-slate-400 line-through">${product.originalPrice}</p>
            )}
          </div>
          <Link 
            to={`/product/${product._id}`}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-colors font-medium"
          >
            <ShoppingBag className="w-4 h-4" />
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

// Testimonial Section
const CustomerTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopReviews();
  }, []);

  const fetchTopReviews = async () => {
    try {
      const { data } = await axios.get('http://localhost:5001/api/reviews?status=approved&limit=6');
      setTestimonials(data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-indigo-600 text-sm font-semibold shadow-sm mb-4">
            <Quote className="w-4 h-4" />
            Customer Love
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {review.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{review.userName}</p>
                  <StarRating rating={review.rating} />
                </div>
              </div>
              
              {review.title && <h4 className="font-semibold text-slate-800 mb-2">{review.title}</h4>}
              <p className="text-slate-600 mb-4">"{review.comment}"</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                {review.recommend && (
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Recommends
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Main Hero Component
function Hero() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

   /* useEffect(() => {
    fetchFeaturedProducts();
  }, []);

    const fetchFeaturedProducts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5001/api/products/featured');
        setFeaturedProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      // Fallback data
    setFeaturedProducts([
        {
          _id: '1',
          name: 'Premium Wireless Headphones',
          description: 'Crystal clear sound with active noise cancellation',
          price: 299,
          originalPrice: 399,
          discount: 25,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          rating: 4.8,
          reviewCount: 128
        },
        {
          _id: '2',
          name: 'Smart Watch Pro',
          description: 'Track your fitness and stay connected',
          price: 199,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
          rating: 4.6,
          reviewCount: 89
        },
        {
          _id: '3',
          name: 'Portable Speaker',
          description: '360° sound with deep bass',
          price: 149,
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
          rating: 4.9,
          reviewCount: 256
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }*/

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                New Collection 2024
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Discover Premium Quality Products
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-lg">
                Shop our curated collection of top-rated products with authentic customer reviews
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/products"
                  className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Shop Now
                </Link>
                <Link 
                  to="/reviews"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-colors"
                >
                  <Star className="w-5 h-5" />
                  Read Reviews
                </Link>
              </div>
              
              <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
                <div>
                  <p className="text-3xl font-bold">50K+</p>
                  <p className="text-slate-400 text-sm">Happy Customers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">4.8</p>
                  <p className="text-slate-400 text-sm">Average Rating</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">10K+</p>
                  <p className="text-slate-400 text-sm">Reviews</p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl transform rotate-3 opacity-20"></div>
                <img 
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
                  alt="Featured Products"
                  className="relative rounded-3xl shadow-2xl"
                />
                
                <div className="absolute -bottom-6 -left-6 bg-white text-slate-800 p-4 rounded-xl shadow-xl max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={5} />
                    <span className="font-bold">5.0</span>
                  </div>
                  <p className="text-sm text-slate-600">"Amazing quality and fast shipping!"</p>
                  <p className="text-xs text-slate-400 mt-2">- Sarah M.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4">
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Top Rated
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              Featured Products
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <FeaturedProduct key={product._id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/products"
              className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <CustomerTestimonials />

      {/* Trust Badges */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-slate-800">Verified Reviews</p>
              <p className="text-sm text-slate-500">Only from real customers</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-semibold text-slate-800">Secure Shopping</p>
              <p className="text-sm text-slate-500">100% secure checkout</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
              <p className="font-semibold text-slate-800">Fast Delivery</p>
              <p className="text-sm text-slate-500">Free shipping over $50</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <RotateCcw className="w-6 h-6 text-orange-600" />
              </div>
              <p className="font-semibold text-slate-800">Easy Returns</p>
              <p className="text-sm text-slate-500">30-day return policy</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Hero;