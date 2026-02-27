import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RotateCcw, 
  Camera,
  X,
  ChevronRight,
  ShoppingBag,
  Calendar,
  MapPin,
  Star,
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Return states
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returningOrder, setReturningOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnPhotos, setReturnPhotos] = useState([]);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  
  // Review states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentReviewItem, setCurrentReviewItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [recommendProduct, setRecommendProduct] = useState(true);
  
  // View reviews modal
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [currentProductReviews, setCurrentProductReviews] = useState([]);
  const [currentProductStats, setCurrentProductStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [currentProductName, setCurrentProductName] = useState('');
  
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const { token } = useSelector(state => state.auth);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // ADD THE NEW fetchOrders FUNCTION HERE - Replace your existing one with this:
  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    
    try {
      console.log('Fetching orders...');
      const { data } = await axios.get(
        'http://localhost:5001/api/orders/myorders',
        { headers: { Authorization: 'Bearer ' + token } }
      );
      
      console.log('Orders fetched:', data.length);
      
      // Process orders to check review status for each item
      const processedOrders = await Promise.all(
        data.map(async (order) => {
          const processedItems = await Promise.all(
            order.items.map(async (item, itemIndex) => {
              // Extract product data from populated object
              let productId = null;
              let productName = '';
              let productImage = '';
              
              if (item.product && typeof item.product === 'object') {
                productId = item.product._id?.toString();
                productName = item.product.name;
                productImage = item.product.image;
              } else if (item.product) {
                productId = item.product.toString();
              }
              
              // Check review status only for delivered orders with valid productId
              let hasReviewed = false;
              let review = null;
              
              if (order.status === 'delivered' && productId) {
                try {
                  console.log(`Checking review: order=${order._id}, product=${productId}`);
                  const reviewRes = await axios.get(
                    `http://localhost:5001/api/reviews/check/${order._id}/${productId}`,
                    { headers: { Authorization: 'Bearer ' + token } }
                  );
                  hasReviewed = reviewRes.data.hasReviewed;
                  review = reviewRes.data.review;
                  console.log(`Review check result:`, reviewRes.data);
                } catch (err) {
                  // If 404, it means no review exists (which is expected)
                  if (err.response?.status === 404) {
                    console.log(`No review found for order ${order._id}, product ${productId} (expected for new items)`);
                    hasReviewed = false;
                    review = null;
                  } else {
                    console.error('Review check error:', err.message);
                  }
                }
              }
              
              return {
                ...item,
                productId,
                productName: productName || item.name || `Item ${itemIndex + 1}`,
                productImage: productImage || item.image || '/placeholder.jpg',
                hasReviewed,
                review
              };
            })
          );
          
          return { ...order, items: processedItems };
        })
      );
      
      setOrders(processedOrders);
      console.log('Orders processed successfully');
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      alert('Failed to load orders. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Compress image before upload
  const compressImage = (base64String, maxWidth = 600, quality = 0.6) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(base64String);
    });
  };

  const handlePhotoUpload = async (e, isReview = false) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const currentPhotos = isReview ? reviewPhotos : returnPhotos;
    const setter = isReview ? setReviewPhotos : setReturnPhotos;
    
    if (currentPhotos.length + files.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }

    setUploading(true);
    const newPhotos = [];

    for (const file of files) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result);
        newPhotos.push(compressed);
        
        if (newPhotos.length === files.length) {
          setter([...currentPhotos, ...newPhotos]);
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index, isReview = false) => {
    if (isReview) {
      setReviewPhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setReturnPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  // SUBMIT REVIEW
  const submitReview = async () => {
    if (reviewRating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!reviewComment.trim()) {
      alert('Please write a review comment');
      return;
    }

    setReviewSubmitting(true);
    
    try {
      console.log('Submitting review:', {
        orderId: currentReviewItem.orderId,
        productId: currentReviewItem.productId,
        rating: reviewRating
      });

      const response = await axios.post(
        'http://localhost:5001/api/reviews',
        {
          orderId: currentReviewItem.orderId,
          productId: currentReviewItem.productId,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          photos: reviewPhotos,
          recommend: recommendProduct
        },
        { 
          headers: { 
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Review submitted successfully:', response.data);
      
      // Close modal and reset
      setReviewModalOpen(false);
      setReviewRating(0);
      setReviewTitle('');
      setReviewComment('');
      setReviewPhotos([]);
      setRecommendProduct(true);
      setCurrentReviewItem(null);
      
      // Refresh orders to show updated status
      await fetchOrders(false);
      
      alert('Review submitted successfully! It will appear after admin approval.');
    } catch (error) {
      console.error('Review submission error:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // SUBMIT RETURN
  const submitReturn = async () => {
    if (!returnReason.trim()) {
      alert('Please provide a return reason');
      return;
    }
    if (returnPhotos.length === 0) {
      alert('Please upload at least one photo');
      return;
    }

    setReturnSubmitting(true);
    
    try {
      console.log('Submitting return for order:', returningOrder._id);

      const response = await axios.post(
        `http://localhost:5001/api/orders/${returningOrder._id}/return`,
        { 
          returnReason, 
          returnPhotos 
        },
        { 
          headers: { 
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Return submitted successfully:', response.data);
      
      // Close modal and reset
      setReturnModalOpen(false);
      setReturningOrder(null);
      setReturnReason('');
      setReturnPhotos([]);
      
      // Refresh orders to show updated status
      await fetchOrders(false);
      
      alert('Return request submitted successfully!');
    } catch (error) {
      console.error('Return submission error:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to submit return. Please try again.');
    } finally {
      setReturnSubmitting(false);
    }
  };

  // Fetch product reviews
  const openReviewsModal = async (productId, productName) => {
    try {
      const { data } = await axios.get(`http://localhost:5001/api/reviews/product/${productId}`);
      setCurrentProductReviews(data.reviews);
      setCurrentProductStats({
        averageRating: data.averageRating,
        totalReviews: data.totalReviews
      });
      setCurrentProductName(productName);
      setReviewsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const canReturn = (order) => {
    if (order.status !== 'delivered') return false;
    const deliveryDate = new Date(order.updatedAt || order.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now - deliveryDate) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Order Placed' },
      processing: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Package, label: 'Processing' },
      shipped: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Truck, label: 'Shipped' },
      delivered: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle, label: 'Delivered' },
      cancelled: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' },
      return_requested: { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: RotateCcw, label: 'Return Requested' },
      returned: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: CheckCircle, label: 'Returned' }
    };
    return configs[status] || configs.pending;
  };

  const getStatusProgress = (status) => {
    const map = { pending: 1, processing: 2, shipped: 3, delivered: 4, cancelled: 0, return_requested: 4, returned: 4 };
    return map[status] || 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <ShoppingBag className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-800 mb-3">No Orders Yet</h2>
          <Link to="/" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-800">My Orders</h1>
            </div>
            <p className="text-slate-500">Track and manage your orders</p>
          </div>
          <button 
            onClick={() => fetchOrders(false)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* REVIEW MODAL */}
        {reviewModalOpen && currentReviewItem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Write a Review</h3>
                  <p className="text-sm text-slate-500">{currentReviewItem.productName}</p>
                </div>
                <button 
                  onClick={() => !reviewSubmitting && setReviewModalOpen(false)}
                  className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 disabled:opacity-50"
                  disabled={reviewSubmitting}
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Rating */}
                <div className="text-center">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">How would you rate this product?</label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        disabled={reviewSubmitting}
                        className="p-1 transition-transform hover:scale-110 disabled:cursor-not-allowed"
                      >
                        <Star className={`w-10 h-10 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-600">
                    {reviewRating > 0 && ['Poor', 'Fair', 'Average', 'Good', 'Excellent'][reviewRating - 1]}
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Review Title</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    disabled={reviewSubmitting}
                    placeholder="Summarize your experience"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-slate-50"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Your Review <span className="text-red-500">*</span></label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    disabled={reviewSubmitting}
                    placeholder="What did you like or dislike?"
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none disabled:bg-slate-50"
                    required
                  />
                </div>

                {/* Recommend */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Would you recommend this?</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setRecommendProduct(true)}
                      disabled={reviewSubmitting}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors ${recommendProduct ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-slate-100 text-slate-600'}`}
                    >
                      <ThumbsUp className="w-4 h-4 inline mr-2" />Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecommendProduct(false)}
                      disabled={reviewSubmitting}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors ${!recommendProduct ? 'bg-red-100 text-red-700 border-2 border-red-500' : 'bg-slate-100 text-slate-600'}`}
                    >
                      <ThumbsDown className="w-4 h-4 inline mr-2" />No
                    </button>
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Photos (optional, max 5)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-yellow-400 cursor-pointer relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, true)}
                      disabled={reviewSubmitting || uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">{uploading ? 'Processing...' : 'Click to upload'}</p>
                  </div>
                  
                  {reviewPhotos.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {reviewPhotos.map((photo, idx) => (
                        <div key={idx} className="relative">
                          <img src={photo} alt="" className="w-16 h-16 object-cover rounded-lg" />
                          {!reviewSubmitting && (
                            <button
                              onClick={() => removePhoto(idx, true)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => setReviewModalOpen(false)}
                  disabled={reviewSubmitting}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={reviewSubmitting || reviewRating === 0 || !reviewComment.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reviewSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Submit Review</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RETURN MODAL */}
        {returnModalOpen && returningOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">Return Order #{returningOrder._id.slice(-8).toUpperCase()}</h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Return Reason <span className="text-red-500">*</span></label>
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    disabled={returnSubmitting}
                    placeholder="Why are you returning this order?"
                    rows="4"
                    className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Photos <span className="text-red-500">*</span></label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-orange-400 cursor-pointer relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={returnSubmitting || uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Camera className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">{uploading ? 'Processing...' : 'Click to upload photos'}</p>
                  </div>
                  
                  {returnPhotos.length > 0 && (
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {returnPhotos.map((photo, idx) => (
                        <div key={idx} className="relative">
                          <img src={photo} alt="" className="w-20 h-20 object-cover rounded-xl" />
                          {!returnSubmitting && (
                            <button
                              onClick={() => removePhoto(idx)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => setReturnModalOpen(false)}
                  disabled={returnSubmitting}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReturn}
                  disabled={returnSubmitting || !returnReason.trim() || returnPhotos.length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {returnSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    'Submit Return'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW REVIEWS MODAL */}
        {reviewsModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Reviews: {currentProductName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{currentProductStats.averageRating}</span>
                    <span className="text-slate-500">({currentProductStats.totalReviews} reviews)</span>
                  </div>
                </div>
                <button 
                  onClick={() => setReviewsModalOpen(false)}
                  className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              
              <div className="overflow-y-auto p-6 space-y-4">
                {currentProductReviews.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No reviews yet</p>
                ) : (
                  currentProductReviews.map((review) => (
                    <div key={review._id} className="border-b border-slate-100 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200'}`} />
                          ))}
                        </div>
                        <span className="font-semibold text-sm">{review.userName}</span>
                        <span className="text-slate-400 text-sm">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}
                      <p className="text-slate-600 text-sm">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS LIST */}
        <div className="space-y-6">
          {orders.map(order => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedOrder === order._id;
            
            const pendingReviews = order.status === 'delivered' 
              ? order.items?.filter(item => !item.hasReviewed && item.productId).length 
              : 0;
            const completedReviews = order.items?.filter(item => item.hasReviewed).length || 0;

            return (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
                {/* Order Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.color}`}>
                        <StatusIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-semibold text-slate-700">#{order._id.slice(-8).toUpperCase()}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-800">${(order.finalAmount || 0).toFixed(2)}</p>
                      <p className="text-sm text-slate-500">{order.items?.length || 0} items</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {order.status !== 'cancelled' && order.status !== 'returned' && (
                    <div className="mt-6">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${(getStatusProgress(order.status) / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Body */}
                <div className="p-5 sm:p-6">
                  {/* Review Banner */}
                  {order.status === 'delivered' && (
                    <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
                      pendingReviews > 0 ? 'bg-yellow-50 border border-yellow-200' : 
                      completedReviews > 0 ? 'bg-green-50 border border-green-200' : 'bg-slate-50'
                    }`}>
                      <AlertCircle className={`w-5 h-5 ${pendingReviews > 0 ? 'text-yellow-600' : completedReviews > 0 ? 'text-green-600' : 'text-slate-400'}`} />
                      <div className="flex-1">
                        {pendingReviews > 0 ? (
                          <p className="text-sm font-medium text-yellow-800">
                            {pendingReviews} item{pendingReviews > 1 ? 's' : ''} waiting for your review
                          </p>
                        ) : completedReviews > 0 ? (
                          <p className="text-sm font-medium text-green-800">
                            You've reviewed {completedReviews} of {order.items.length} items
                          </p>
                        ) : (
                          <p className="text-sm text-slate-600">No reviews yet</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Items Preview */}
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex-shrink-0 flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                        <img src={item.productImage} alt={item.productName} className="w-14 h-14 object-cover rounded-lg" />
                        <div>
                          <p className="font-medium text-sm text-slate-800 truncate max-w-[120px]">{item.productName}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    className="w-full mt-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 flex items-center justify-center gap-2"
                  >
                    {isExpanded ? 'Show Less' : 'View Details'}
                    <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <h4 className="font-semibold text-slate-700 mb-3">Order Items</h4>
                      
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl mb-3">
                          <img src={item.productImage} alt={item.productName} className="w-20 h-20 object-cover rounded-lg" />
                          <div className="flex-1">
                            <p className="font-semibold text-lg text-slate-800">{item.productName}</p>
                            <p className="text-slate-500">Qty: {item.quantity} × ${item.price}</p>
                            <p className="font-bold text-indigo-600">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                            
                            {/* Action Buttons */}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {order.status === 'delivered' && item.productId && (
                                <>
                                  {item.hasReviewed ? (
                                    <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      <span className="text-sm font-medium">Rated {item.review?.rating}/5</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setCurrentReviewItem({
                                          orderId: order._id,
                                          productId: item.productId,
                                          productName: item.productName,
                                          productImage: item.productImage
                                        });
                                        setReviewModalOpen(true);
                                      }}
                                      className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg font-medium hover:bg-yellow-200"
                                    >
                                      <Star className="w-4 h-4" /> Write Review
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => openReviewsModal(item.productId, item.productName)}
                                    className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50"
                                  >
                                    <MessageSquare className="w-4 h-4" /> See Reviews
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Order Summary */}
                      <div className="bg-slate-50 rounded-xl p-4 mt-4 space-y-2">
                        <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span>${(order.totalAmount || 0).toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-600">Shipping</span><span>{(order.courierCharge || 0) === 0 ? 'FREE' : `$${order.courierCharge}`}</span></div>
                        <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-lg text-indigo-600">
                          <span>Total</span><span>${(order.finalAmount || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-3">
                  {order.status === 'delivered' && pendingReviews > 0 && (
                    <button
                      onClick={() => {
                        const firstUnreviewed = order.items.find(item => !item.hasReviewed && item.productId);
                        if (firstUnreviewed) {
                          setCurrentReviewItem({
                            orderId: order._id,
                            productId: firstUnreviewed.productId,
                            productName: firstUnreviewed.productName,
                            productImage: firstUnreviewed.productImage
                          });
                          setReviewModalOpen(true);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600"
                    >
                      <Star className="w-5 h-5" /> Review Purchase ({pendingReviews} pending)
                    </button>
                  )}

                  {canReturn(order) && (
                    <button
                      onClick={() => {
                        setReturningOrder(order);
                        setReturnModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600"
                    >
                      <RotateCcw className="w-5 h-5" /> Request Return (7 days)
                    </button>
                  )}

                  {order.status === 'shipped' && (
                    <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700">
                      <Truck className="w-5 h-5" /> Track Order
                    </button>
                  )}

                  {order.status === 'delivered' && pendingReviews === 0 && !canReturn(order) && (
                    <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-medium">
                      <CheckCircle className="w-5 h-5" /> Order Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Orders;