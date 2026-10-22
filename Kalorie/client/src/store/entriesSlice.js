import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client.js';

const emptyMeals = { breakfast: [], lunch: [], dinner: [], snack: [] };

export const fetchDay = createAsyncThunk('entries/fetchDay', async (date, { rejectWithValue }) => {
  try {
    return await api.getDay(date);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addEntry = createAsyncThunk(
  'entries/addEntry',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await api.addEntry(payload);
      // Re-fetch so totals stay authoritative from the server.
      dispatch(fetchDay(payload.date));
      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const bulkAddEntries = createAsyncThunk(
  'entries/bulkAdd',
  async ({ date, meal, items }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.bulkAddEntries({ date, meal, items });
      dispatch(fetchDay(date));
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeEntry = createAsyncThunk(
  'entries/removeEntry',
  async ({ id, date }, { dispatch, rejectWithValue }) => {
    try {
      await api.deleteEntry(id);
      dispatch(fetchDay(date));
      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 'YYYY-MM-DD' for today in local time.
function todayStr() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

const entriesSlice = createSlice({
  name: 'entries',
  initialState: {
    date: todayStr(),
    meals: emptyMeals,
    totals: { calories: 0, carbs: 0, protein: 0 },
    status: 'idle',
    error: null,
  },
  reducers: {
    setDate(state, action) {
      state.date = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDay.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDay.fulfilled, (state, action) => {
        state.status = 'idle';
        state.date = action.payload.date;
        state.meals = action.payload.meals;
        state.totals = action.payload.totals;
      })
      .addCase(fetchDay.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Could not load the day';
      });
  },
});

export const { setDate } = entriesSlice.actions;
export default entriesSlice.reducer;
