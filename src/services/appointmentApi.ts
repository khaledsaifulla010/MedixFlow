import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Availability {
  isRecurring: boolean;
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  speciality?: string;
  degree?: string;
  availabilities: Availability[];
}

export const appointmentApi = createApi({
  reducerPath: "appointmentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  endpoints: (builder) => ({
    getAvailableDoctors: builder.query<Doctor[], void>({
      query: () => "api/doctor/available",
    }),
  }),
});

export const { useGetAvailableDoctorsQuery } = appointmentApi;
