import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation<
      { token: string; user: { username: string } },
      { username: string; password: string }
    >({
      async queryFn({ username, password }) {
        if (username === "admin" && password === "admin") {
          return {
            data: {
              token: "mock-token",
              user: { username },
            },
          };
        }

        return {
          error: {
            status: 401,
            data: { message: "Неверный логин или пароль" },
          },
        };
      },
    }),
  }),
});

export const { useLoginMutation } = authApi;
