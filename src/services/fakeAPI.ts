import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const fakeApi = createApi({
  reducerPath: "fakeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://jsonplaceholder.typicode.com/",
  }),
  tagTypes: ["Todo"], // cache invalidation
  endpoints: (builder) => ({
    // GET
    getFakedataById: builder.query<any, { id: string }>({
      query: ({ id }) => `todos/${id}`,
      providesTags: ["Todo"],
    }),

    // POST
    createTodo: builder.mutation<any, { title: string }>({
      query: (body) => ({
        url: "todos",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Todo"], // 👈 auto refetch GET
    }),

    // PUT
    updateTodo: builder.mutation<any, { id: string; title: string }>({
      query: ({ id, ...body }) => ({
        url: `todos/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Todo"],
    }),

    // DELETE
    deleteTodo: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `todos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Todo"],
    }),
  }),
});



/*** 
 * Export Hook name should be in this format
 * 
 * 1. Add - use
 * 2. Use Endpoints Fn name(Starts with Capital) - CreateTodo
 * 3. Add Mutation/Query
 * 
 * Result - useCreateTodoQuery[GET] (or) useCreateTodoMutation[POST,PUT,DELETE]
 *  ***/

export const {
  useGetFakedataByIdQuery,
  useCreateTodoMutation,
  useDeleteTodoMutation,
  useUpdateTodoMutation,
} = fakeApi;
