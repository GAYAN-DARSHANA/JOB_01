import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';

function ProductCard({ product }) {
  const dispatch = useDispatch();

  return (
    <div className="card group">
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
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{product.name}</h3>
        </div>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-blue-600">${product.price}</span>
            <span className="text-sm text-gray-400 ml-2">USD</span>
          </div>
          
          <button
            onClick={() => dispatch(addToCart(product))}
            disabled={product.stock === 0}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;