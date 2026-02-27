// hooks/useProductReviews.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useProductReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;
    
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:5001/api/reviews/product/${productId}`);
        setReviews(data.reviews.slice(0, 3));
        setStats({
          averageRating: data.averageRating,
          totalReviews: data.totalReviews
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  return { reviews, stats, loading, error };
};