import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Doctor {
  id: string;
  user: { name: string };
  speciality: string;
  degree: string;
}

export interface MedicalHistory {
  id: string;
  patientProfileId: string;
  allergies?: string | null;
  pastTreatments?: string | null;
  files: string[];
  createdAt: string;
}

export interface PatientUser {
  name: string;
  email: string;
  phone: string;
}

export interface PatientForAppointment {
  user: PatientUser;
  histories: MedicalHistory[];
}

export interface Appointment {
  isEmergency: any;
  id: string;
  doctorId: string;
  patientId: string;
  startTime: string;
  endTime: string;
  doctor: Doctor;
  patient?: PatientForAppointment;
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

export interface AdminDoctorUser {
  name: string;
  email: string;
}
export interface AdminDoctor {
  id: string;
  user: AdminDoctorUser;
  speciality: string;
  degree: string;
}
export interface AdminPatientUser {
  name: string;
  email: string;
  phone: string;
}
export interface AdminPatient {
  user: AdminPatientUser;
}
export interface AdminAppointment {
  id: string;
  startTime: string;
  endTime: string;
  doctor: AdminDoctor;
  patient: AdminPatient;
}

export const appointmentApi = createApi({
  reducerPath: "appointmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    fetchFn: (input, init = {}) =>
      fetch(input, { ...init, credentials: "include" }),
  }),
  tagTypes: ["Availability", "Appointment", "AdminAppointment"],
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
      { doctorId: string; startTime: string; endTime: string }
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
    getAllAppointmentsAdmin: builder.query<AdminAppointment[], void>({
      query: () => "/admin/appointments",
      providesTags: ["AdminAppointment"],
      transformResponse: (res: { data: AdminAppointment[] }) => res.data,
    }),
  }),
});

export const {
  useGetAvailabilitiesQuery,
  useGetAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useGetAllAppointmentsAdminQuery,
} = appointmentApi;
