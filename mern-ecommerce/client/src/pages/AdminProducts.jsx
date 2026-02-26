import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: ''
  });

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:5001/api/products'
      );
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      alert('Failed to fetch products');
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        await axios.put(
          `http://localhost:5001/api/products/${editingProduct._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        alert('Product updated successfully');
      } else {
        await axios.post(
          'http://localhost:5001/api/products',
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        alert('Product created successfully');
      }

      await fetchProducts();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?'))
      return;

    try {
      await axios.delete(
        `http://localhost:5001/api/products/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      await fetchProducts();
      alert('Product deleted successfully');
    } catch (error) {
      alert('Failed to delete product');
      console.error(error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || '',
      category: product?.category || '',
      stock: product?.stock || '',
      image: product?.image || ''
    });
  };

  const resetForm = () => {
    setEditingProduct(null);

    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image: ''
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8">Manage Products</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow mb-8"
      >
        <h3 className="text-xl font-bold mb-4">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="p-2 border rounded"
            required
          />

          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="p-2 border rounded"
            required
          />
        </div>

        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({
              ...formData,
              description: e.target.value
            })
          }
          className="w-full p-2 border rounded mb-4"
          required
        />

        <div className="grid grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value
              })
            }
            className="p-2 border rounded"
            required
          />

          <input
            type="number"
            placeholder="Stock"
            value={formData.stock}
            onChange={(e) =>
              setFormData({
                ...formData,
                stock: e.target.value
              })
            }
            className="p-2 border rounded"
            required
          />

          <input
            type="text"
            placeholder="Image URL"
            value={formData.image}
            onChange={(e) =>
              setFormData({
                ...formData,
                image: e.target.value
              })
            }
            className="p-2 border rounded"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>

          {editingProduct && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-lg shadow">
        <h3 className="text-xl font-bold p-6 border-b">
          All Products
        </h3>

        {products.map((product) => (
          <div
            key={product._id}
            className="p-6 border-b last:border-0 flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <img
                src={product?.image || '/placeholder.png'}
                alt={product?.name || 'Product'}
                className="w-16 h-16 object-cover rounded"
              />

              <div>
                <h4 className="font-semibold">
                  {product?.name || 'Unnamed'}
                </h4>

                <p className="text-gray-600">
                  ${product?.price ?? 0} | Stock:{' '}
                  {product?.stock ?? 0}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(product)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(product._id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
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