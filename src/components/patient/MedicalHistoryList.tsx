"use client";
import { useGetUserDetails } from "@/hooks/useGetUserDetails";
import { useGetMedicalHistoryQuery } from "@/services/medicalHistory";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Bandage, Files, NutOff } from "lucide-react";

export default function MedicalHistoryList() {
  const { user } = useGetUserDetails();

  const {
    data: histories = [],
    isLoading,
    isError,
  } = useGetMedicalHistoryQuery(user?.id ?? "", {
    skip: !user?.id,
  });

  if (isLoading) return <div>Loading medical history...</div>;
  if (isError) return <div>Error fetching medical history.</div>;
  if (!histories.length) return <div>No medical history found.</div>;

  return (
    <div>
      <h3>Medical History</h3>
      <div className="grid grid-cols-2 ">
        {histories.map((history) => (
          <Card
            key={history.id}
            className="w-[550px] dark:bg-gray-900 border-2"
          >
            
            <CardContent className="-mt-4">
              <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                <tbody>
                  <tr className="border-b-2 dark:border-gray-700">
                    <td className="py-2 flex items-center gap-2 font-semibold whitespace-nowrap">
                      <NutOff className="h-5" />
                      Allergies
                    </td>
                    <td className="py-2">{history.allergies || "None"}</td>
                  </tr>
                  <tr className="border-b-2 dark:border-gray-700">
                    <td className="py-2 flex items-center gap-2 font-semibold whitespace-nowrap">
                      <Bandage className="h-5" /> Past Treatments
                    </td>
                    <td className="py-2">{history.pastTreatments || "None"}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
            <p className="border-b-2"></p>
            {history.files.length > 0 && (
              <>
                <CardTitle className="text-xl flex items-center gap-2 font-bold ml-6 -mt-2">
                  <Files className="h-5" /> Related Files
                </CardTitle>
                <CardContent className="-mt-4">
                  <div className="grid grid-cols-1 gap-2">
                    {history.files.map((file, i) => {
                      const fileName = file.split("/").pop() || "";
                      const maxLength = Math.floor(fileName.length / 2);
                      const displayName =
                        fileName.length > maxLength
                          ? fileName.slice(0, maxLength) +
                            "..." +
                            fileName.split(".").pop()
                          : fileName;

                      return (
                        <div key={i} className="flex items-center gap-1">
                          <span>{i + 1}.</span>
                          <a
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-600 flex items-center"
                          >
                            {displayName}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </>
            )}
            <p className="border-b-2"></p>
            <CardContent>
              <p className="text-sm text-gray-500 -mb-2 -mt-2">
                Created At: {new Date(history.createdAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
