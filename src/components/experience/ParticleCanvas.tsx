import { useEffect, useRef } from "react";
import { experienceText } from "../../data/texts";
import {
  createParticleList,
  drawParticleList,
  updateParticleList,
} from "../../simulation/particleField";
import styles from "./ParticleCanvas.module.css";
import {
  connectPointerToHand,
  createHandSummary,
  updateHandVelocity,
} from "../../input/pointerHand";
import {
  createChargeState,
  getChargeStep,
  updateCharge,
} from "../../simulation/charge";
import { drawBurstFlash, drawHandMarker } from "../../simulation/handMarker";

const PARTICLE_COUNT = 10000;
const MAX_DELTA_TIME = 0.1;

type ParticleCanvasProps = {
  onChargeStepChange: (chargeStep: number) => void;
};

function ParticleCanvas({ onChargeStepChange }: ParticleCanvasProps) {
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

    const particleList = createParticleList(
      PARTICLE_COUNT,
      canvas.width,
      canvas.height,
    );
    const hand = createHandSummary();
    const disconnectPointer = connectPointerToHand(canvas, hand);
    const charge = createChargeState();
    let lastChargeStep = 0;
    let previousHandX = hand.x;
    let previousHandY = hand.y;
    let lastTime = performance.now();
    let elapsedTime = 0;
    let frameId = 0;

    const drawFrame = (currentTime: number) => {
      const deltaTime = Math.min(
        (currentTime - lastTime) / 1000,
        MAX_DELTA_TIME,
      );
      lastTime = currentTime;
      elapsedTime = elapsedTime + deltaTime;

      if (
        canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight
      ) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
      updateHandVelocity(hand, previousHandX, previousHandY, deltaTime);
      previousHandX = hand.x;
      previousHandY = hand.y;
      updateCharge(charge, hand, deltaTime);

      const chargeStep = getChargeStep(charge.level);
      if (chargeStep !== lastChargeStep) {
        lastChargeStep = chargeStep;
        onChargeStepChange(chargeStep);
      }

      updateParticleList(
        particleList,
        hand,
        charge,
        deltaTime,
        elapsedTime,
        canvas.width,
        canvas.height,
      );

      context.clearRect(0, 0, canvas.width, canvas.height);
      drawParticleList(context, particleList);
      drawBurstFlash(context, charge);
      drawHandMarker(context, hand, charge, elapsedTime);

      frameId = requestAnimationFrame(drawFrame);
    };

    frameId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(frameId);
      disconnectPointer();
    };
  }, [onChargeStepChange]);

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
