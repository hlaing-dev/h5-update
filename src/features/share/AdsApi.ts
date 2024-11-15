import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const AdsApi = createApi({
  reducerPath: "adsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL,
    prepareHeaders: (headers) => {
        headers.set("X-Client-Version", "3098");
        return headers;
      },
  }),
  endpoints: (builder) => ({
    getAdsTotal: builder.query({
      query: () => ({
        url: "/advert/config",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAdsTotalQuery } = AdsApi;
export default AdsApi;