import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, tokenStore } from '../api/client.js';

const storedUser = JSON.parse(localStorage.getItem('ct_user') || 'null');

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await api.register(payload);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    return await api.login(payload);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      return await api.updateProfile(payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: tokenStore.get(),
    status: 'idle', // 'idle' | 'loading' | 'failed'
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      tokenStore.clear();
      localStorage.removeItem('ct_user');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const onPending = (state) => {
      state.status = 'loading';
      state.error = null;
    };
    const onFulfilled = (state, action) => {
      state.status = 'idle';
      state.user = action.payload.user;
      state.token = action.payload.token;
      tokenStore.set(action.payload.token);
      localStorage.setItem('ct_user', JSON.stringify(action.payload.user));
    };
    const onRejected = (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Something went wrong';
    };

    builder
      .addCase(register.pending, onPending)
      .addCase(register.fulfilled, onFulfilled)
      .addCase(register.rejected, onRejected)
      .addCase(login.pending, onPending)
      .addCase(login.fulfilled, onFulfilled)
      .addCase(login.rejected, onRejected)
      // Profile updates: keep the token, just refresh the stored user.
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem('ct_user', JSON.stringify(action.payload.user));
      })
      .addCase(updateProfile.rejected, onRejected);
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
