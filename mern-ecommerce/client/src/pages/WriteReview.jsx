// pages/WriteReview.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Upload, X, CheckCircle, Package } from 'lucide-react';
import { submitReview, clearSubmitSuccess } from '../features/reviews/reviewSlice';
import { StarRating } from '../components/StarRating';

export default function WriteReview() {
  const { orderId, productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { loading, submitSuccess, error } = useSelector((state) => state.reviews);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [recommend, setRecommend] = useState(true);

  // Mock product data - replace with actual fetch
  const [product, setProduct] = useState({
    id: productId,
    name: 'Premium Wireless Headphones',
    image: '/api/placeholder/200/200',
    orderDate: '2024-01-15',
    deliveredDate: '2024-01-18',
  });

  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearSubmitSuccess());
        navigate('/orders');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, dispatch, navigate]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    const reviewData = {
      orderId,
      productId,
      userId: user.id,
      userName: user.name,
      rating,
      title,
      comment,
      pros: pros.split(',').map(p => p.trim()).filter(Boolean),
      cons: cons.split(',').map(c => c.trim()).filter(Boolean),
      recommend,
      images: images.map(img => img.file),
      status: 'pending', // Requires admin approval
      createdAt: new Date().toISOString(),
    };

    dispatch(submitReview(reviewData));
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Review Submitted!</h2>
            <p className="text-slate-600 mb-6">
              Thank you for your feedback. Your review is pending approval and will appear on the product page soon.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                to="/orders" 
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Back to Orders
              </Link>
              <Link 
                to="/" 
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/orders" className="text-slate-500 hover:text-violet-600 flex items-center gap-2 mb-4">
            <Package className="w-4 h-4" />
            Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Write a Review</h1>
          <p className="text-slate-500">Share your experience with this product</p>
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex gap-4">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-24 h-24 object-cover rounded-xl"
            />
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">{product.name}</h3>
              <p className="text-slate-500 text-sm">Ordered on {product.orderDate}</p>
              <p className="text-green-600 text-sm font-medium">
                Delivered on {product.deliveredDate}
              </p>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl">
              {error}
            </div>
          )}

          {/* Star Rating */}
          <div className="mb-8 text-center">
            <label className="block text-lg font-semibold text-slate-800 mb-4">
              How would you rate this product?
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-2 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="mt-2 text-slate-600 font-medium">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Average'}
              {rating === 4 && 'Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          {/* Review Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Review Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>

          {/* Review Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? How was the quality?"
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              required
            />
            <p className="mt-1 text-sm text-slate-500">{comment.length}/1000 characters</p>
          </div>

          {/* Pros & Cons */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pros <span className="text-slate-400">(comma separated)</span>
              </label>
              <input
                type="text"
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                placeholder="Great sound, Comfortable, Long battery..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cons <span className="text-slate-400">(comma separated)</span>
              </label>
              <input
                type="text"
                value={cons}
                onChange={(e) => setCons(e.target.value)}
                placeholder="Expensive, Heavy..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Add Photos <span className="text-slate-400">(optional, max 5)</span>
            </label>
            <div className="flex flex-wrap gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 hover:bg-violet-50 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Recommend */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Would you recommend this to a friend?
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setRecommend(true)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  recommend
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-slate-100 text-slate-600 border-2 border-transparent'
                }`}
              >
                Yes, I recommend it
              </button>
              <button
                type="button"
                onClick={() => setRecommend(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  !recommend
                    ? 'bg-red-100 text-red-700 border-2 border-red-500'
                    : 'bg-slate-100 text-slate-600 border-2 border-transparent'
                }`}
              >
                No, I don't
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}