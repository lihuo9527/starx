import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  banner: undefined,
};

const slice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    setBanner(state, action) {
      state.banner = action.payload;
    },
  },
});

export const { 
  setBanner,
} = slice.actions;

// Reducer
export default slice.reducer;
