import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [selectedRelated, setSelectedRelated] = useState([]);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5001/api/products');
      setProducts(data);
    } catch (error) {
      alert('Failed to fetch products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        name,
        description,
        price,
        category,
        stock,
        image,
        relatedProducts: selectedRelated
      };

      if (editingProduct) {
        await axios.put(
          'http://localhost:5001/api/products/' + editingProduct._id,
          submitData,
          { headers: { Authorization: 'Bearer ' + token } }
        );
        alert('Product updated successfully');
      } else {
        await axios.post(
          'http://localhost:5001/api/products',
          submitData,
          { headers: { Authorization: 'Bearer ' + token } }
        );
        alert('Product created successfully');
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete('http://localhost:5001/api/products/' + id, {
        headers: { Authorization: 'Bearer ' + token }
      });
      fetchProducts();
      alert('Product deleted successfully');
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setCategory(product.category);
    setStock(product.stock);
    setImage(product.image);
    setSelectedRelated(product.relatedProducts?.map(p => p._id || p) || []);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setStock('');
    setImage('');
    setSelectedRelated([]);
  };

  const toggleRelated = (productId) => {
    if (selectedRelated.includes(productId)) {
      setSelectedRelated(selectedRelated.filter(id => id !== productId));
    } else {
      setSelectedRelated([...selectedRelated, productId]);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h2 className="text-3xl font-bold mb-8">Manage Products</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h3 className="text-xl font-bold mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          rows="3"
          required
        />

        <div className="grid grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Related Products</label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {products.filter(p => !editingProduct || p._id !== editingProduct._id).map(product => (
              <label key={product._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRelated.includes(product._id)}
                  onChange={() => toggleRelated(product._id)}
                  className="w-4 h-4 text-blue-600"
                />
                <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded" />
                <span className="text-sm">{product.name}</span>
              </label>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">Selected: {selectedRelated.length} products</p>
        </div>

        <div className="flex gap-4">
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
          {editingProduct && (
            <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <h3 className="text-xl font-bold p-6 border-b">All Products</h3>
        {products.map(product => (
          <div key={product._id} className="p-6 border-b last:border-0 flex justify-between items-center hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
              <div>
                <h4 className="font-semibold">{product.name}</h4>
                <p className="text-gray-600">${product.price} | Stock: {product.stock}</p>
                {product.relatedProducts?.length > 0 && (
                  <p className="text-sm text-blue-600">{product.relatedProducts.length} related products</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(product)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
                Edit
              </button>
              <button onClick={() => handleDelete(product._id)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminProducts;