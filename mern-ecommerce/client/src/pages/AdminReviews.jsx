import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  
  const { token } = useSelector(state => state.auth);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const { data } = await axios.get(
        `http://localhost:5001/api/reviews?page=1&limit=50${statusParam}`,
        { headers: { Authorization: 'Bearer ' + token } }
      );
      setReviews(data.reviews);
      
      // Fetch stats
      const statsRes = await axios.get(
        'http://localhost:5001/api/reviews/stats/overview',
        { headers: { Authorization: 'Bearer ' + token } }
      );
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const handleStatusUpdate = async (reviewId, status) => {
    try {
      await axios.put(
        `http://localhost:5001/api/reviews/${reviewId}/status`,
        { status },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      fetchReviews();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await axios.delete(
        `http://localhost:5001/api/reviews/${reviewId}`,
        { headers: { Authorization: 'Bearer ' + token } }
      );
      fetchReviews();
    } catch (error) {
      alert('Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter(review => 
    review.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.productId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Review Management</h1>
          <p className="text-slate-500">Manage customer reviews and ratings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm mb-1">Total Reviews</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalReviews}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingReviews}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approvedReviews}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm mb-1">Avg Rating</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.averageRating}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'pending', 'approved', 'rejected'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                    filter === f 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-slate-500">Loading reviews...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map(review => (
              <div key={review._id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Review Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-indigo-600">
                            {review.userName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{review.userName}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(review.status)}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
                          />
                        ))}
                      </div>
                      <span className="font-bold text-slate-700">{review.rating}/5</span>
                    </div>

                    {review.title && (
                      <h4 className="font-semibold text-slate-800 mb-2">{review.title}</h4>
                    )}
                    
                    <p className="text-slate-600 mb-3">{review.comment}</p>

                    {review.photos?.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {review.photos.map((photo, idx) => (
                          <img 
                            key={idx}
                            src={photo}
                            alt=""
                            className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                            onClick={() => setSelectedReview(review)}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>Product: {review.productId}</span>
                      <span>•</span>
                      <span>Order: {review.orderId?.slice(-8)}</span>
                      <span>•</span>
                      <span className={review.recommend ? 'text-green-600' : 'text-red-600'}>
                        {review.recommend ? 'Recommends' : 'Does not recommend'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 justify-end">
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(review._id, 'approved')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(review._id, 'rejected')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredReviews.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-slate-500">No reviews found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Review Details</h3>
              <button 
                onClick={() => setSelectedReview(null)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-lg font-semibold text-indigo-600">
                  {selectedReview.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedReview.userName}</p>
                  <p className="text-slate-500">{new Date(selectedReview.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-6 h-6 ${i < selectedReview.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
                  />
                ))}
                <span className="text-lg font-bold ml-2">{selectedReview.rating} out of 5</span>
              </div>

              {selectedReview.title && (
                <h4 className="font-semibold text-xl">{selectedReview.title}</h4>
              )}
              
              <p className="text-slate-600 text-lg leading-relaxed">{selectedReview.comment}</p>

              {selectedReview.photos?.length > 0 && (
                <div>
                  <p className="font-semibold text-slate-700 mb-2">Photos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedReview.photos.map((photo, idx) => (
                      <img key={idx} src={photo} alt="" className="w-full h-32 object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <p><span className="font-semibold">Product ID:</span> {selectedReview.productId}</p>
                <p><span className="font-semibold">Order ID:</span> {selectedReview.orderId}</p>
                <p><span className="font-semibold">Status:</span> {getStatusBadge(selectedReview.status)}</p>
                <p>
                  <span className="font-semibold">Recommendation:</span>{' '}
                  <span className={selectedReview.recommend ? 'text-green-600' : 'text-red-600'}>
                    {selectedReview.recommend ? 'Yes, recommends' : 'No, does not recommend'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}