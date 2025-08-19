import EHRRecordsTable from "@/components/doctor/EHRRecordsTable";

const EHRRecordsPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mt-8">EHR Records</h1>

      <div>
        <EHRRecordsTable />
      </div>
    </div>
  );
};

export default EHRRecordsPage;
