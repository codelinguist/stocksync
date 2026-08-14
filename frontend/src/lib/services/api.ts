import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export interface Product {
  id: number;
  sku: string;
  name: string;
  stockQuantity: number;
  vendor: string;
  updatedAt: string;
}

export interface StockEvent {
  id: number;
  sku: string;
  productName: string;
  vendor: string;
  currentQuantity: number;
  eventTime: string;
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => "products",
    }),
    getStockEvents: builder.query<StockEvent[], void>({
      query: () => "stock-events",
    }),
  }),
});

export const { useGetProductsQuery, useGetStockEventsQuery } = baseApi;
