// features/featureslice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ConfigurationState {
btnState:boolean
}

const initialState: ConfigurationState = {
btnState:false
};

const configurationSlice = createSlice({
  name: "configuration",
  initialState,
  reducers: {
    setBtnState: (state, action: PayloadAction<boolean>) => {
      state.btnState=action.payload;
    },
  
  },
});

export const {
  setBtnState
} = configurationSlice.actions;

export default configurationSlice.reducer;
