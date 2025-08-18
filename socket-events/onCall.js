const onCall = async (io, participants) => {
  if (!participants?.receiver) {
    console.error("Receiver missing in onCall:", participants);
    return;
  }
  if (!participants.receiver.socketId) {
    console.error("Receiver socketId missing:", participants.receiver);
    return;
  }

  console.log("Sending call to receiver:", participants.receiver.userName);

  io.to(participants.receiver.socketId).emit("inComingCall", participants);
};

export default onCall;
