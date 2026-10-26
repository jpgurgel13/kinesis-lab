import { useEffect, useRef } from "react";
import { experienceText } from "../../data/texts";
import styles from "./ParticleCanvas.module.css";

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 3, 40, 0, Math.PI * 2);
    context.fillStyle = "#3b82f6";
    context.fill();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      role="img"
      aria-label={experienceText.canvasLabel}
    />
  );
}

export default ParticleCanvas;
