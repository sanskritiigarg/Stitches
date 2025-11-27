import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Retrieve user Info and token from localStorage if available
const userFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;
let currUser = null;

if (userFromStorage) {
  const EXPIRY_TIME = 40 * 24 * 60 * 60 * 1000;
  const loginTime = userFromStorage.loginTime;
  const now = Date.now();

  if (now - loginTime < EXPIRY_TIME) {
    currUser = userFromStorage;
  } else {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
    currUser = null;
  }
}

// Check for an exisitng guest ID in the localStorage or generate a new one
const initialGuestId = localStorage.getItem('guestId') || `guest_${new Date().getTime()}`;
localStorage.setItem('guestId', initialGuestId);

// Initial State
const initialState = {
  user: currUser,
  guestId: initialGuestId,
  loading: false,
  error: null,
};

// Async Thunk for User Login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
        userData,
      );

      const userWithTime = { ...response.data.user, loginTime: Date.now() };
      localStorage.setItem('userInfo', JSON.stringify(userWithTime));
      localStorage.setItem('userToken', response.data.token);

      return userWithTime;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// Async Thunk for User Registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
        userData,
      );

      const userWithTime = { ...response.data.user, loginTime: Date.now() };
      localStorage.setItem('userInfo', JSON.stringify(userWithTime));
      localStorage.setItem('userToken', response.data.token);

      return userWithTime;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.guestId = `guest_${new Date().getTime()}`; //reset guestId on logout
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userToken');
      localStorage.setItem('guestId', state.guestId);
    },
    generateNewGuestId: (state) => {
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.setItem('guestId', state.guestId);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  },
});

export const { logout, generateNewGuestId, clearError } = authSlice.actions;
export default authSlice.reducer;
