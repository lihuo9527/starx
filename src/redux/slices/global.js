import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  message: {
    variant: undefined,  // default success error warning info
    msg: '',
    // 多语言影响, 部分文字不能写死. 
    // 现在只处理 i18n + msg 更复杂情况以后再说, react内的自己处理成msg
    i18nKey: '',
    // t: 0, // 防内容相同不触发
  },
};

const slice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    // 请求报错
    setGlobalMessage(state, action) {
      const newMessage = action.payload;
      state.message = typeof newMessage === 'string' ? {
        msg: newMessage,
        // t: new Date(),
      } : newMessage;
    },
  },
});

export const { 
  setGlobalMessage,
} = slice.actions;

// Reducer
export default slice.reducer;
