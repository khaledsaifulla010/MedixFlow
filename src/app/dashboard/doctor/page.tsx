"use client";
import ListOnlineUsers from "@/components/listOnlineUsers/ListOnlineUsers";
import VideoCall from "@/components/videoCall/VideoCall";

const DoctorDashboard = () => {
  return (
    <div className=" mt-6 px-4">
      <h1 className=" font-bold text-3xl">Welcome to Doctor Dashboard</h1>
      <ListOnlineUsers />
      <div>
        <VideoCall />
      </div>
    </div>
  );
};

export default DoctorDashboard;
