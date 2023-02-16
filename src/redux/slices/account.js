import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  relation: undefined,
};

const slice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    clearAccount() {
      return initialState;
    },
    setRelation(state, action) {
      state.relation = action.payload;
    },
  },
});

export const { 
  clearAccount,
  setRelation,
} = slice.actions;

// Reducer
export default slice.reducer;
