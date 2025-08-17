// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import VideoCallWithChat from "@/components/videoCall/VideoCall";
// import { useSocket } from "../../../../../context/SocketContext";

// const MeetingPage = () => {
//   const { onlineUsers, user, handleJoinCall, ongoingCall, requestJoinMeeting } =
//     useSocket();

//   const roomId = "defaultRoom"; // Can be dynamic per appointment
//   const [hasRequested, setHasRequested] = useState(false);

//   // Send join request to doctor
//   const handleJoinClick = () => {
//     requestJoinMeeting(roomId);
//     setHasRequested(true);
//   };

//   // Reset join request state if call ends
//   useEffect(() => {
//     if (!ongoingCall) setHasRequested(false);
//   }, [ongoingCall]);

//   // Auto join call when doctor approves
//   useEffect(() => {
//     if (!ongoingCall || !user || !onlineUsers || !hasRequested) return;

//     const currentSocketUser = onlineUsers.find((u) => u.userId === user.id);
//     if (!currentSocketUser) return;

//     const { participants } = ongoingCall;

//     // Join call if current user is the receiver (patient)
//     if (participants.receiver.userId === user.id) {
//       handleJoinCall(ongoingCall);
//     }
//   }, [ongoingCall, user, onlineUsers, handleJoinCall, hasRequested]);

//   return (
//     <div className="p-4">
//       <h1 className="text-3xl font-bold mb-6">Your Appointments</h1>

//       {ongoingCall ? (
//         <VideoCallWithChat />
//       ) : (
//         <div className="flex flex-col gap-3">
//           <Button
//             onClick={handleJoinClick}
//             className="bg-blue-500 text-white"
//             disabled={hasRequested}
//           >
//             {hasRequested ? "Waiting for doctor approval..." : "Join Meeting"}
//           </Button>
//           {hasRequested && (
//             <p className="text-gray-400">Waiting for doctor approval...</p>
//           )}
//           {!hasRequested && (
//             <p className="text-gray-400">
//               Click “Join Meeting” to request to join your appointment.
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default MeetingPage;



const page = () => {
  return (
    <div>
      <h1>hello</h1>
    </div>
  );
};

export default page;