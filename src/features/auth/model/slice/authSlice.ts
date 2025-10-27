import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "../types/types";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuth: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuth = true;

      localStorage.setItem(
        "auth",
        JSON.stringify({
          user: state.user,
          token: state.token,
        })
      );
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuth = false;
      localStorage.removeItem("auth");
    },
    restoreAuth(state) {
      const saved = localStorage.getItem("auth");
      if (saved) {
        const { user, token } = JSON.parse(saved);
        state.user = user;
        state.token = token;
        state.isAuth = true;
      }
    },
  },
});

const { reducer: authReducer, actions } = authSlice;
export const { setAuth, logout, restoreAuth } = actions;

export default authReducer;
