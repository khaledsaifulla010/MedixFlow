import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PrescriptionFormData } from "@/validation/prescriptionSchema";

export const prescriptionApi = createApi({
  reducerPath: "prescriptionApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Prescription"],
  endpoints: (builder) => ({
    createPrescription: builder.mutation<any, PrescriptionFormData>({
      query: (body) => ({
        url: "/doctor/prescription",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Prescription"],
    }),

    getPrescriptions: builder.query<any, void>({
      query: () => "/doctor/prescription",
      providesTags: ["Prescription"],
    }),
  }),
});

export const { useCreatePrescriptionMutation, useGetPrescriptionsQuery } =
  prescriptionApi;
