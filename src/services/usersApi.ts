import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type Role = "admin" | "doctor" | "patient";

export interface DoctorProfileDTO {
  id: string;
  speciality: string;
  degree: string;
  createdAt: string;
  _count: { appointments: number; availabilities: number };
}
export interface PatientProfileDTO {
  id: string;
  createdAt: string;
  _count: { histories: number; appointments: number };
}
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  role: Role;
  createdAt: string;
  doctorProfile?: DoctorProfileDTO | null;
  patientProfile?: PatientProfileDTO | null;
}
export interface UsersResponse {
  ok: boolean;
  data: UserDTO[];
  error?: string;
}

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getAllUsers: builder.query<UserDTO[], void>({
      query: () => `/api/admin/users`,
      transformResponse: (response: UsersResponse) => {
        if (!response?.ok)
          throw new Error(response?.error || "Failed to load users");
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((u) => ({ type: "Users" as const, id: u.id })),
              { type: "Users" as const, id: "LIST" },
            ]
          : [{ type: "Users" as const, id: "LIST" }],
    }),

    deleteUser: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/api/admin/users/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: (_res, _err, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),
  }),
});

export const { useGetAllUsersQuery, useDeleteUserMutation } = usersApi;
