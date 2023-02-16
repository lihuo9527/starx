import { createSlice } from '@reduxjs/toolkit';
import { getWarehouseList } from 'src/services/warehouse';
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  options: {
    warehouse: undefined,
    shelf: undefined,
  },
};

const slice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    // 仓库货架选项
    setWarehouseOptions(state, action) {
      const { warehouse, shelf } = action.payload;
      state.options = {
        warehouse,
        shelf,
      }
    },
    clearWarehouseOptions(state, action) {
      const clearKey = action.payload;
      if (!clearKey) {
        state.options = initialState.options;
      } else {
        state.options[clearKey] = undefined;
      }
    }
  },
});

export const { 
  setWarehouseOptions,
  clearWarehouseOptions,
} = slice.actions;

// Reducer
export default slice.reducer;




// 获取仓库货架选项
export function getWarehouseOptions() {
  return async () => {
    try {
      const resData = await getWarehouseList({
        pageIndex: 1,
        pageSize: 999,
      });
      const list = resData.data;
      const warehouse = [];
      const shelf = {};

      for (let i = 0, len = list.length; i < len; i += 1) {
        const { id, warehouseName, stockCount, shelfList } = list[i];
        warehouse.push({
          label: warehouseName,
          value: id,
          count: stockCount,
        })
        shelf[id] = shelfList.map(v => ({
          label: v.shelves,
          value: v.id,
          area: v.area,
        }))
      }

      dispatch(setWarehouseOptions({
        warehouse,
        shelf,
      }))

    } catch (error) {
      console.error(error);
    }
  };
}