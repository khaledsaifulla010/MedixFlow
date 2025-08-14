import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  startTime: string;
  endTime: string;
  isRead: boolean;
  createdAt: string;
  doctor: {
    id: string;
    userId: string;
    speciality: string;
    degree: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
  patient: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
}

export const appointmentApi = createApi({
  reducerPath: "appointmentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Appointments"],
  endpoints: (builder) => ({
    getPatientAppointments: builder.query<Appointment[], void>({
      query: () => `api/patient/appointments`,
      transformResponse: (response: {
        appointments: Appointment[];
        availabilities: any;
      }) => response.appointments,
      providesTags: ["Appointments"],
    }),
  }),
});

export const { useGetPatientAppointmentsQuery } = appointmentApi;
