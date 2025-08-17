"use client";
import { useEffect, useRef } from "react";

interface IVideoContainer {
  stream: MediaStream | null;
  isLocalStream: boolean;
  isOnCall: boolean;
}

const VideoContainer = ({
  stream,
  isLocalStream,
  isOnCall,
}: IVideoContainer) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocalStream}
      className={`rounded-md ${
        isLocalStream && isOnCall
          ? "w-[200px] h-[120px] absolute"
          : "w-[800px] h-[450px]"
      }`}
    />
  );
};

export default VideoContainer;
