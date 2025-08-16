import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Doctor {
  id: string;
  user: { name: string };
  speciality: string;
  degree: string;
}

export interface Availability {
  id: string;
  doctorId: string;
  doctor: Doctor;
  date: string | null;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  dayOfWeek?: number;
}

export interface Appointment {
  isEmergency: any;
  id: string;
  doctorId: string;
  patientId: string;
  startTime: string;
  endTime: string;
  doctor: Doctor;
  patient?: {
    user: {
      name: string;
      email: string;
      phone: string;
    };
  };
}

export const appointmentApi = createApi({
  reducerPath: "appointmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    fetchFn: (input, init = {}) =>
      fetch(input, { ...init, credentials: "include" }),
  }),
  tagTypes: ["Availability", "Appointment"],

  endpoints: (builder) => ({
    getAvailabilities: builder.query<Availability[], void>({
      query: () => "/doctor/available",
      providesTags: ["Availability"],
      transformResponse: (res: { data: Availability[] }) => res.data,
    }),
    getAppointments: builder.query<Appointment[], void>({
      query: () => "/patient/appointment",
      providesTags: ["Appointment"],
      transformResponse: (res: { data: Appointment[] }) => res.data,
    }),

    createAppointment: builder.mutation<
      Appointment,
      Partial<Appointment> & { doctorId: string }
    >({
      query: (body) => ({
        url: "/patient/appointment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Appointment"],
    }),

    updateAppointment: builder.mutation<
      Appointment,
      { appointmentId: string; startTime: string; endTime: string }
    >({
      query: (body) => ({
        url: "/patient/appointment",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Appointment"],
    }),
  }),
});

export const {
  useGetAvailabilitiesQuery,
  useGetAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
} = appointmentApi;
