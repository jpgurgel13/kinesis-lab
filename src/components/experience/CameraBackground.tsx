import { useEffect, useRef } from "react";
import styles from "./CameraBackground.module.css";

type CameraBackgroundProps = {
  stream: MediaStream;
};

function CameraBackground({ stream }: CameraBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.srcObject = stream;

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  return (
    <video
      ref={videoRef}
      className={styles.video}
      autoPlay
      muted
      playsInline
      aria-hidden="true"
    />
  );
}

export default CameraBackground;
