import type { HandSummary } from "../types/handTypes";

const MARKER_RADIUS = 24;
const OPEN_COLOR = "#3b82f6";
const CLOSED_COLOR = "#f04452";
const VELOCITY_LINE_SCALE = 0.1;

export function drawHandMarker(
  context: CanvasRenderingContext2D,
  hand: HandSummary,
) {
  if (!hand.isVisible) {
    return;
  }

  const color = hand.isClosed ? CLOSED_COLOR : OPEN_COLOR;

  context.strokeStyle = color;
  context.lineWidth = 2;

  context.beginPath();
  context.arc(hand.x, hand.y, MARKER_RADIUS, 0, Math.PI * 2);
  context.stroke();

  context.beginPath();
  context.moveTo(hand.x, hand.y);
  context.lineTo(
    hand.x + hand.velocityX * VELOCITY_LINE_SCALE,
    hand.y + hand.velocityY * VELOCITY_LINE_SCALE,
  );
  context.stroke();
}
