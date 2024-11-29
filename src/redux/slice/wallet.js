import { createSlice } from "@reduxjs/toolkit";
import { CHAIN_ETHEREUM, META_WALLET_KEY } from "../../utils/common";

const state = {
  meta: {
    address: null,
    publicKey: null
  },
  active: [],
  chain: CHAIN_ETHEREUM
};

const walletSlice = createSlice({
  name: "wallet",
  initialState: state,
  reducers: {

    setMetaCredentials: (state, action) => {
      state.meta = action.payload;
      state.active.push(META_WALLET_KEY);
    },

    setChain: (state, action) => {
      state.chain = action.payload;
    },

    clearWalletState: (state) => {
      state.meta = {
        address: null,
        publicKey: null
      }
      state.active = []
      state.chain = ""
    }
  }
});

export const {
  setChain,
  clearWalletState,
  setMetaCredentials,
} = walletSlice.actions;
export default walletSlice.reducer;
