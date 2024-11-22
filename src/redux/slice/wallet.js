import { createSlice } from "@reduxjs/toolkit";
import { META_WALLET_KEY } from "../../utils/common";

const state = {
  meta: {
    address: null,
    publicKey: null
  },
  active: [],
};

const walletSlice = createSlice({
  name: "wallet",
  initialState: state,
  reducers: {

    setMetaCredentials: (state, action) => {
      state.meta = action.payload;
      state.active.push(META_WALLET_KEY);
    },

    clearWalletState: (state) => {
      state.meta = {
        address: null,
        publicKey: null
      }
      state.active = []
    }
  }
});

export const {
  setMetaCredentials,
  clearWalletState,
} = walletSlice.actions;
export default walletSlice.reducer;
