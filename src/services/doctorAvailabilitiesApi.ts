import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface DoctorAvailability {
  id: string;
  isRecurring: boolean;
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  doctorId: string;
  doctor: {
    id: string;
    speciality: string;
    degree: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      dob: string;
      role: "admin" | "doctor" | "patient";
    };
  };
}

export const doctorAvailabilitiesApi = createApi({
  reducerPath: "doctorAvailabilitiesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/doctor/available" }),
  endpoints: (builder) => ({
    getDoctorAvailabilities: builder.query<
      { success: boolean; data: DoctorAvailability[] },
      void
    >({
      query: () => "",
    }),
  }),
});

export const { useGetDoctorAvailabilitiesQuery } = doctorAvailabilitiesApi;
