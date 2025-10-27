import { configureStore } from "@reduxjs/toolkit";
import { simulatorReducer } from "entities/manipulator";
import { authApi, authReducer } from "features/auth";
import { historyApi } from "widgets/history";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    simulator: simulatorReducer,
    [authApi.reducerPath]: authApi.reducer,
    [historyApi.reducerPath]: historyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, historyApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
