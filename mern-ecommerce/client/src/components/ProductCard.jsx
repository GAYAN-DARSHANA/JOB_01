import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { addToCart } from '../features/cart/cartSlice';

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [related, setRelated] = useState([]);
  const [showRelated, setShowRelated] = useState(false);

  useEffect(() => {
    if (showRelated) {
      fetchRelated();
    }
  }, [showRelated]);

  const fetchRelated = async () => {
    try {
      const { data } = await axios.get('http://localhost:5001/api/products/' + product._id + '/related');
      setRelated(data);
    } catch (error) {
      console.error('Failed to fetch related products');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group relative">
      <div className="relative overflow-hidden">
        <img 
          src={product.image || 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image'} 
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.stock < 5 && product.stock > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            Only {product.stock} left!
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 left-3 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            Out of Stock
          </span>
        )}
        
        <button
          onClick={() => dispatch(addToCart(product))}
          disabled={product.stock === 0}
          className="absolute bottom-3 right-3 bg-white text-blue-600 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:bg-gray-300 disabled:text-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-blue-600">${product.price}</span>
          
          <button
            onClick={() => setShowRelated(!showRelated)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showRelated ? 'Hide' : 'Related'} →
          </button>
        </div>

        <button
          onClick={() => dispatch(addToCart(product))}
          disabled={product.stock === 0}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>

        {showRelated && related.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-semibold text-gray-700 mb-3">You may also like:</p>
            <div className="space-y-3">
              {related.map(item => (
                <div key={item._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-sm text-blue-600">${item.price}</p>
                  </div>
                  <button
                    onClick={() => dispatch(addToCart(item))}
                    disabled={item.stock === 0}
                    className="text-blue-600 hover:bg-blue-100 p-2 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;