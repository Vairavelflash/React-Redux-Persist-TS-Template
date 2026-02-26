// features/featureslice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ConfigurationState {
buttonState:boolean
}

const initialState: ConfigurationState = {
buttonState:false
};

const configurationSlice = createSlice({
  name: "configuration",
  initialState,
  reducers: {
    setButtonState: (state, action: PayloadAction<boolean>) => {
      state.buttonState=action.payload;
    },
  
  },
});

export const {
  setButtonState
} = configurationSlice.actions;

export default configurationSlice.reducer;
