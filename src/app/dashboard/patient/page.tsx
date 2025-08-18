import CallNotification from "@/components/CallNotification/CallNotification";
import VideoCall from "@/components/videoCall/VideoCall";

const PatientDashboard = () => {
  return (
    <div className=" mt-6 px-4">
      <h1 className=" font-bold text-3xl">Welcome to Patient Dashboard</h1>
      <VideoCall />
      <CallNotification />
    </div>
  );
};

export default PatientDashboard;
