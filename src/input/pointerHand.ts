import type { HandSummary } from "../types/handTypes";

const HAND_SMOOTHING = 12; // quanto maior, mais rápido a velocidade reage

export function createHandSummary(): HandSummary {
  return {
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    isVisible: false,
    isClosed: false,
    shape: null,
  };
}

export function connectPointerToHand(
  canvas: HTMLCanvasElement,
  hand: HandSummary,
) {
  const handlePointerMove = (event: PointerEvent) => {
    const canvasBox = canvas.getBoundingClientRect();
    hand.x = event.clientX - canvasBox.left;
    hand.y = event.clientY - canvasBox.top;
    hand.isVisible = true;
  };

  const handlePointerDown = () => {
    hand.isClosed = true;
  };

  const handlePointerUp = () => {
    hand.isClosed = false;
  };

  const handlePointerLeave = () => {
    hand.isVisible = false;
    hand.isClosed = false;
  };

  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointerleave", handlePointerLeave);

  return () => {
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointerup", handlePointerUp);
    canvas.removeEventListener("pointerleave", handlePointerLeave);
  };
}

export function updateHandVelocity(
  hand: HandSummary,
  previousX: number,
  previousY: number,
  deltaTime: number,
) {
  if (deltaTime === 0) {
    return;
  }

  const measuredVelocityX = (hand.x - previousX) / deltaTime;
  const measuredVelocityY = (hand.y - previousY) / deltaTime;
  const smoothingAmount = Math.min(HAND_SMOOTHING * deltaTime, 1);

  hand.velocityX =
    hand.velocityX + (measuredVelocityX - hand.velocityX) * smoothingAmount;
  hand.velocityY =
    hand.velocityY + (measuredVelocityY - hand.velocityY) * smoothingAmount;
}
