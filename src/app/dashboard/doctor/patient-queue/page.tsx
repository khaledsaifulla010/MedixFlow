// "use client";

// import VideoCallWithChat from "@/components/videoCall/VideoCall";
// import { useSocket } from "../../../../../context/SocketContext";
// import { Button } from "@/components/ui/button";
// import { SocketUser } from "../../../../../types";

// const PatientQueuePage = () => {
//   const {
//     waitingPatients,
//     approvePatient,
//     rejectPatient,
//     handleJoinCall,
//     ongoingCall,
//     user,
//     onlineUsers,
//   } = useSocket();

//   // Construct current user as SocketUser
//   const currentSocketUser: SocketUser | undefined = user
//     ? onlineUsers?.find((u) => u.userId === user.id)
//       ? {
//           socketId: onlineUsers!.find((u) => u.userId === user.id)!.socketId,
//           userId: user.id,
//           userName: user.name,
//           userEmail: user.email,
//           userRole: user.role,
//         }
//       : undefined
//     : undefined;

//   const handleApproveAndJoin = (patient: SocketUser) => {
//     if (!currentSocketUser) return;

//     // Approve the patient in waiting list
//     approvePatient(patient.userId);

//     // Join the call with patient
//     handleJoinCall({
//       participants: {
//         caller: patient,
//         receiver: currentSocketUser,
//       },
//       isRinging: false,
//     });
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-3xl font-bold mb-4">Patient Queue</h1>

//       {waitingPatients.length === 0 && <p>No waiting patients</p>}

//       {waitingPatients.map((p) => (
//         <div
//           key={p.patient.userId}
//           className="flex justify-between items-center mb-2 border p-2 rounded"
//         >
//           <span>
//             {p.patient.userName} ({p.patient.userEmail})
//           </span>
//           <div className="flex gap-2">
//             <Button
//               onClick={() => handleApproveAndJoin(p.patient)}
//               className="bg-green-500"
//             >
//               Approve & Join
//             </Button>
//             <Button
//               onClick={() => rejectPatient(p.patient.userId)}
//               className="bg-red-500"
//             >
//               Reject
//             </Button>
//           </div>
//         </div>
//       ))}

//       {/* Render Video Call if ongoing */}
//       {ongoingCall && <VideoCallWithChat />}
//     </div>
//   );
// };

// export default PatientQueuePage;



const page = () => {
  return (
    <div>
      <h1>hello</h1>
    </div>
  );
};

export default page;