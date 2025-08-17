"use client";

import { useSocket } from "../../../context/SocketContext";
import { Button } from "../ui/button";

const CallNotification = () => {
  const { ongoingCall, handleJoinCall } = useSocket();

  if (!ongoingCall?.isRinging) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-[280px] h-[200px] bg-gray-800 border-2 rounded-md p-4 flex flex-col items-center justify-between">
        <h1 className="font-bold text-center text-white text-lg">
          Incoming Call
        </h1>
        <div className="flex gap-4">
          <Button
            className="bg-green-500 text-white"
            onClick={() => handleJoinCall(ongoingCall)}
          >
            Accept
          </Button>
          <Button className="bg-red-500 text-white">Reject</Button>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;
