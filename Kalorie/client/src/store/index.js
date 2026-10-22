import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import entriesReducer from './entriesSlice.js';
import themeReducer from './themeSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    entries: entriesReducer,
    theme: themeReducer,
  },
});
