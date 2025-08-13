
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export interface MedicalHistory {
  id: string;
  patientId: string;
  allergies: string | null;
  pastTreatments: string | null;
  files: string[];
  createdAt: string;
}

interface ApiResponse {
  data: MedicalHistory[];
  error?: string;
}

export const medicalHistory = createApi({
  reducerPath: "medicalHistoryApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }), // absolute root
  tagTypes: ["MedicalHistory"],
  endpoints: (builder) => ({
    getMedicalHistory: builder.query<MedicalHistory[], string>({
      query: (userId) => `api/patient/medical-history?userId=${userId}`, // root-relative
      transformResponse: (response: {
        success: boolean;
        data: MedicalHistory[];
      }) => response.data, // match your Next.js API response
      providesTags: ["MedicalHistory"],
    }),
    createMedicalHistory: builder.mutation<MedicalHistory, FormData>({
      query: (formData) => ({
        url: "api/patient/medical-history",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["MedicalHistory"],
    }),
  }),
});


export const { useGetMedicalHistoryQuery, useCreateMedicalHistoryMutation } =
  medicalHistory;
