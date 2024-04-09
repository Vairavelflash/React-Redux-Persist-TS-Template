// features/featureslice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ConfigurationState {
btn:boolean
}

const initialState: ConfigurationState = {
btn:false
};

const configurationSlice = createSlice({
  name: "configuration",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<boolean>) => {
      state.btn=action.payload;
    },
  
  },
});

export const {
  setState
} = configurationSlice.actions;

export default configurationSlice.reducer;
