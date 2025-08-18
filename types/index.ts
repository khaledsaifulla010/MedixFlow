import Peer from "simple-peer";
export type SocketUser = {
  socketId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
};

export type OngoingCall = {
  participants: Participants;
  isRinging: boolean;
};

export type Participants = {
  caller: SocketUser;
  receiver: SocketUser;
};

export type PeerData = {
  peerConnection: Peer.Instance;
  stream: MediaStream | undefined;
  participantUser: SocketUser;
  isCaller: boolean;
};
