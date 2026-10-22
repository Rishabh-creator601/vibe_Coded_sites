import { createSlice } from '@reduxjs/toolkit';

// Dark is the default per the spec. Persist the user's choice.
const stored = localStorage.getItem('ct_theme');
const initialMode = stored === 'light' || stored === 'dark' ? stored : 'dark';

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: initialMode },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('ct_theme', state.mode);
    },
    setTheme(state, action) {
      state.mode = action.payload;
      localStorage.setItem('ct_theme', state.mode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
