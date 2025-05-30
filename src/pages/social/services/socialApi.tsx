// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { convertToSecureUrl } from "../../../services/newEncryption";

// export const socialApi = createApi({
//   reducerPath: "socialApi",

//   baseQuery: fetchBaseQuery({
//     baseUrl: process.env.REACT_APP_API_URL,
//     prepareHeaders: (headers) => {
//       // Get the auth token from localStorage

//       const storedAuth = JSON.parse(localStorage.getItem("authToken") || "{}");
//       const accessToken = storedAuth?.data?.access_token;
//       const settings = JSON.parse(
//         localStorage.getItem("movieAppSettings") || "{}"
//       );
//       if (settings.filterToggle) {
//         headers.set("X-Client-Setting", JSON.stringify({ "pure-mode": 1 }));
//       } else {
//         headers.set("X-Client-Setting", JSON.stringify({ "pure-mode": 0 }));
//       }

//       headers.set("Accept-Language", "en");

//       // Add Authorization header if access token exists
//       if (accessToken) {
//         headers.set("Authorization", `Bearer ${accessToken}`);
//       }

//       return headers;
//     },
//   }),

//   endpoints: (builder) => ({
//     getPosts: builder.query<any, void>({
//       query: () => {
//         return convertToSecureUrl(`post/list`);
//       },
//     }),
//     getRecommandPosts: builder.query<any, void>({
//       query: () => {
//         return convertToSecureUrl(`post/recommend/list`);
//       },
//     }),
//     getFollowPosts: builder.query<any, void>({
//       query: () => {
//         return convertToSecureUrl(`followed/post/list`);
//       },
//     }),
//   }),
// });

// export const {
//   useGetPostsQuery,
//   useGetRecommandPostsQuery,
//   useGetFollowPostsQuery,
// } = socialApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  convertToSecurePayload,
  convertToSecureUrl,
} from "../../../services/newEncryption";

export const socialApi = createApi({
  reducerPath: "socialApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL,
    prepareHeaders: (headers) => {
      const storedAuth = JSON.parse(localStorage.getItem("authToken") || "{}");
      const accessToken = storedAuth?.data?.access_token;
      const settings = JSON.parse(
        localStorage.getItem("movieAppSettings") || "{}"
      );

      headers.set("Accept-Language", "en");
      headers.set("x-client-version", "3100");
      if (settings.filterToggle) {
        headers.set("X-Client-Setting", JSON.stringify({ "pure-mode": 1 }));
      } else {
        headers.set("X-Client-Setting", JSON.stringify({ "pure-mode": 0 }));
      }
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: ({ page, path }) =>
        convertToSecureUrl(`${path ? path : "/post/list"}?page=${page}`),
    }),
    getRecommandPosts: builder.query({
      query: ({ page, path }) =>
        convertToSecureUrl(
          `${path ? path : "/post/recommend/list"}?page=${page}`
        ),
    }),
    getFollowPosts: builder.query({
      query: ({ page, path }) =>
        convertToSecureUrl(
          `${path ? path : "/followed/post/list"}?page=${page}`
        ),
    }),
    getAudioPosts: builder.query({
      query: ({ page, path }) =>
        convertToSecureUrl(`${path ? path : "/post/audio/list"}?page=${page}`),
    }),
    followUser: builder.mutation<void, { follow_user_id: any; is_follow: any }>(
      {
        query: ({ is_follow, follow_user_id }) => ({
          url: `user/follow/action`,
          method: "POST",
          body: convertToSecurePayload({
            status: is_follow ? 1 : 0,
            follow_user_id,
          }),
        }),
      }
    ),
    likePost: builder.mutation<void, { post_id: any; is_like: any }>({
      query: ({ is_like, post_id }) => ({
        url: `post/reaction`,
        method: "POST",
        body: convertToSecurePayload({
          status: is_like ? 1 : 0,
          post_id,
        }),
      }),
    }),
    getCommentList: builder.query({
      query: ({ post_id, page }) =>
        convertToSecureUrl(`post/comment/list?page=${page}&post_id=${post_id}`),
    }),
    likeComment: builder.mutation<void, { id: any; is_like: any }>({
      query: ({ is_like, id }) => ({
        url: `post/comment/reaction`,
        method: "POST",
        body: convertToSecurePayload({
          status: is_like ? 1 : 0,
          comment_id: id,
        }),
      }),
    }),
    postComment: builder.mutation<
      void,
      { comment_id: any; post_id: any; content: any }
    >({
      query: ({ comment_id, post_id, content }) => ({
        url: `post/comment/create`,
        method: "POST",
        body: convertToSecurePayload({
          comment_id: comment_id,
          post_id: post_id,
          content: content,
        }),
      }),
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetRecommandPostsQuery,
  useGetFollowPostsQuery,
  useFollowUserMutation,
  useLikePostMutation,
  useGetCommentListQuery,
  useLikeCommentMutation,
  usePostCommentMutation,
  useGetAudioPostsQuery,
} = socialApi;
