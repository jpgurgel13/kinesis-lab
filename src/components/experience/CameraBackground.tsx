import { useEffect } from "react";
import type { RefObject } from "react";
import styles from "./CameraBackground.module.css";

type CameraBackgroundProps = {
  stream: MediaStream;
  videoRef: RefObject<HTMLVideoElement | null>;
};

function CameraBackground({ stream, videoRef }: CameraBackgroundProps) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.srcObject = stream;

    return () => {
      video.srcObject = null;
    };
  }, [stream, videoRef]);

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
