"use client";

import { useSelector } from "react-redux";
import { useSocket } from "../../../context/SocketContext";

const ListOnlineUsers = () => {
  const { onlineUsers, handleCall } = useSocket();
  const user = useSelector((state: any) => state.auth.user);

  return (
    <div className="space-y-2">
      {onlineUsers?.map((onlineUser) =>
        user?.id !== onlineUser.userId ? (
          <div
            key={onlineUser.socketId}
            className="flex items-center justify-between p-2 border rounded"
          >
            <span>{onlineUser.userName}</span>
            <button
              onClick={() => handleCall(onlineUser)}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              Call {onlineUser.userName}
            </button>
          </div>
        ) : null
      )}
    </div>
  );
};

export default ListOnlineUsers;
