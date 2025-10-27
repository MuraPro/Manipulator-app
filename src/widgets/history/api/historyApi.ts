import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { load, save } from "../../../shared/localdb";
import type { HistoryItem } from "../../../entities/manipulator/model/types/types";
import { v4 as uuid } from "uuid";

const KEY = "manipulator_history";

export const historyApi = createApi({
  reducerPath: "historyApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["History"],
  endpoints: (b) => ({
    list: b.query<HistoryItem[], void>({
      queryFn() {
        const data = load<HistoryItem[]>(KEY, []);
        return { data };
      },
      providesTags: ["History"],
    }),
    add: b.mutation<void, Omit<HistoryItem, "id" | "dateISO">>({
      async queryFn(item) {
        const list = load<HistoryItem[]>(KEY, []);
        const row: HistoryItem = {
          ...item,
          id: uuid(),
          dateISO: new Date().toISOString(),
        };
        save(KEY, [row, ...list]);
        return { data: undefined };
      },
      invalidatesTags: ["History"],
    }),
    clear: b.mutation<void, void>({
      async queryFn() {
        save(KEY, []);
        return { data: undefined };
      },
      invalidatesTags: ["History"],
    }),
  }),
});

export const { useListQuery, useAddMutation, useClearMutation } = historyApi;
