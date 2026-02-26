import { Link } from 'react-router-dom';

function Hero() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Amazing <br/>
              <span className="text-yellow-300">Products</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-lg">
              Shop the latest trends with unbeatable prices. Free shipping on orders over $50!
            </p>
            <div className="flex gap-4">
              <Link to="/" className="btn-primary bg-white text-blue-600 hover:bg-gray-100">
                Shop Now
              </Link>
              <Link to="/cart" className="btn-secondary border-white text-white hover:bg-white hover:text-blue-600">
                View Cart
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-white/20 rounded-full blur-3xl"></div>
              <img 
                src="https://placehold.co/600x400/ffffff/3b82f6?text=Summer+Collection" 
                alt="Hero" 
                className="relative rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;