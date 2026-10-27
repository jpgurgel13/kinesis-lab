import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { HandTracker } from "../../types/trackerTypes";
import { sendVideoFrame } from "../../input/handTracker";
import { updateHandFromCamera } from "../../input/cameraHand";
import { experienceText } from "../../data/texts";
import {
  createParticleList,
  drawParticleList,
  updateParticleList,
} from "../../simulation/particleField";
import styles from "./ParticleCanvas.module.css";
import {
  connectKeyboardToHand,
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
  handTracker: HandTracker | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  onChargeStepChange: (chargeStep: number) => void;
  onHandVisibleChange: (isHandVisible: boolean) => void;
};

function ParticleCanvas({
  handTracker,
  videoRef,
  onChargeStepChange,
  onHandVisibleChange,
}: ParticleCanvasProps) {
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
    // No modo câmera, quem move a mão é o MediaPipe.
    // Mouse e teclado ficam só na demonstração.
    const isDemo = handTracker === null;
    const disconnectPointer = isDemo
      ? connectPointerToHand(canvas, hand)
      : null;
    const disconnectKeyboard = isDemo
      ? connectKeyboardToHand(canvas, hand)
      : null;
    const charge = createChargeState();
    let lastChargeStep = 0;
    let lastHandVisible = false;
    let lastVideoTime = -1;
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
      // 1. Câmera: manda o quadro novo para o MediaPipe e lê a última mão
      const video = videoRef.current;
      const hasNewVideoFrame =
        video !== null &&
        video.readyState >= 2 &&
        video.currentTime !== lastVideoTime;

      if (handTracker && hasNewVideoFrame) {
        lastVideoTime = video.currentTime;
        sendVideoFrame(handTracker, video, currentTime);
      }

      const trackedHand = handTracker ? handTracker.trackedHand : null;
      const wasHandVisible = hand.isVisible;

      if (handTracker && video) {
        updateHandFromCamera(
          hand,
          trackedHand,
          video,
          canvas.width,
          canvas.height,
          deltaTime,
        );
      }

      // Avisa o React só quando a mão aparece ou some (não a cada quadro)
      if (hand.isVisible !== lastHandVisible) {
        lastHandVisible = hand.isVisible;
        onHandVisibleChange(hand.isVisible);
      }

      // 2. Velocidade da mão. Se ela acabou de aparecer, não conta o "salto"
      // de onde estava antes até onde surgiu, senão as partículas explodiriam.
      if (!wasHandVisible) {
        previousHandX = hand.x;
        previousHandY = hand.y;
      }
      updateHandVelocity(hand, previousHandX, previousHandY, deltaTime);
      previousHandX = hand.x;
      previousHandY = hand.y;

      // 3. Carga e partículas
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

      // 4. Desenho
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawParticleList(context, particleList);
      drawBurstFlash(context, charge);
      drawHandMarker(context, hand, charge, elapsedTime);

      frameId = requestAnimationFrame(drawFrame);
    };

    frameId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(frameId);
      if (disconnectPointer) {
        disconnectPointer();
      }
      if (disconnectKeyboard) {
        disconnectKeyboard();
      }
    };
  }, [handTracker, videoRef, onChargeStepChange, onHandVisibleChange]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      role="img"
      aria-label={
        handTracker
          ? experienceText.canvasLabel
          : experienceText.demoCanvasLabel
      }
      tabIndex={handTracker ? undefined : 0}
    />
  );
}

export default ParticleCanvas;
