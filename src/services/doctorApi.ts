import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Availability {
  isRecurring: boolean;
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
}

export interface DoctorRegisterData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  role: "doctor";
  password: string;
  speciality: string;
  degree: string;
  availabilities: Availability[];
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const doctorApi = createApi({
  reducerPath: "doctorApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  endpoints: (builder) => ({
    registerDoctor: builder.mutation<AuthResponse, DoctorRegisterData>({
      query: (body) => ({
        url: "api/doctor/register",
        method: "POST",
        body,
      }),
    }),
    getDoctorProfile: builder.query<any, string>({
      query: (id) => `api/doctors/${id}`,
    }),
  }),
});

export const { useRegisterDoctorMutation, useGetDoctorProfileQuery } =
  doctorApi;
