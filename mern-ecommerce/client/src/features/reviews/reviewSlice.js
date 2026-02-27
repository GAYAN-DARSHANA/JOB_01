import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async (reviewData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(
        'http://localhost:5001/api/reviews',
        reviewData,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/reviews/product/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const fetchAllReviews = createAsyncThunk(
  'reviews/fetchAllReviews',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(
        'http://localhost:5001/api/reviews',
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

// Create slice
const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [],
    productReviews: [],
    userReviews: [],
    averageRatings: {},
    stats: {
      totalReviews: 0,
      averageRating: 0,
      pendingApproval: 0,
    },
    loading: false,
    error: null,
    submitSuccess: false,
  },
  reducers: {
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit review
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.loading = false;
        state.submitSuccess = true;
        state.reviews.push(action.payload);
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.productReviews = action.payload.reviews;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch all reviews
      .addCase(fetchAllReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.stats = {
          totalReviews: action.payload.total,
          pendingApproval: action.payload.stats?.pending || 0,
          averageRating: 0,
        };
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { clearSubmitSuccess, clearError } = reviewSlice.actions;

// Export reducer as default
export default reviewSlice.reducer;