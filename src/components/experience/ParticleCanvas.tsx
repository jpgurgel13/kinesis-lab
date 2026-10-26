import { useEffect, useRef } from "react";
import { experienceText } from "../../data/texts";
import styles from "./ParticleCanvas.module.css";

const CIRCLE_RADIUS = 40;
const CIRCLE_SPEED = 120;
const MAX_DELTA_TIME = 0.1;

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

    let circleX = 0;
    let lastTime = performance.now();
    let frameId = 0;

    const drawFrame = (currentTime: number) => {
      const deltaTime = Math.min(
        (currentTime - lastTime) / 1000,
        MAX_DELTA_TIME,
      );
      lastTime = currentTime;

      if (
        canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight
      ) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      circleX = circleX + CIRCLE_SPEED * deltaTime;
      if (circleX > canvas.width + CIRCLE_RADIUS) {
        circleX = -CIRCLE_RADIUS;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();
      context.arc(circleX, canvas.height / 3, CIRCLE_RADIUS, 0, Math.PI * 2);
      context.fillStyle = "#3b82f6";
      context.fill();

      frameId = requestAnimationFrame(drawFrame);
    };

    frameId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(frameId);
    };
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
