import type { ChargeState } from "../types/chargeTypes";
import type { HandSummary } from "../types/handTypes";
import { getHeatColor } from "./heatColor";

const MARKER_RADIUS = 24;
const OPEN_COLOR = "#3b82f6";
const VELOCITY_LINE_SCALE = 0.1;
const CHARGE_RING_GAP = 8; // distância entre o anel e o indicador de carga
const PULSE_SPEED = 12; // velocidade da pulsação com a carga cheia
const PULSE_SIZE = 6; // pixels que o indicador cresce ao pulsar
const FLASH_RADIUS = 160; // pixels: tamanho do flash com carga cheia

export function drawHandMarker(
  context: CanvasRenderingContext2D,
  hand: HandSummary,
  charge: ChargeState,
  elapsedTime: number,
) {
  if (!hand.isVisible) {
    return;
  }

  if (hand.isClosed) {
    drawChargeIndicator(context, hand, charge, elapsedTime);
    return;
  }

  context.strokeStyle = OPEN_COLOR;
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

function drawChargeIndicator(
  context: CanvasRenderingContext2D,
  hand: HandSummary,
  charge: ChargeState,
  elapsedTime: number,
) {
  const isFull = charge.level >= 1;
  const pulse = isFull ? Math.sin(elapsedTime * PULSE_SPEED) * PULSE_SIZE : 0;
  const radius = MARKER_RADIUS + CHARGE_RING_GAP + pulse;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + charge.level * Math.PI * 2;

  context.lineWidth = 3;

  context.strokeStyle = "rgba(255, 255, 255, 0.15)";
  context.beginPath();
  context.arc(hand.x, hand.y, radius, 0, Math.PI * 2);
  context.stroke();

  context.strokeStyle = getHeatColor(charge.level);
  context.beginPath();
  context.arc(hand.x, hand.y, radius, startAngle, endAngle);
  context.stroke();
}

export function drawBurstFlash(
  context: CanvasRenderingContext2D,
  charge: ChargeState,
) {
  if (charge.flashLevel <= 0) {
    return;
  }

  const radius = FLASH_RADIUS * charge.flashLevel;
  const gradient = context.createRadialGradient(
    charge.flashX,
    charge.flashY,
    0,
    charge.flashX,
    charge.flashY,
    radius,
  );
  gradient.addColorStop(0, `rgba(255, 214, 218, ${charge.flashLevel})`);
  gradient.addColorStop(1, "rgba(240, 68, 82, 0)");

  context.fillStyle = gradient;
  context.beginPath();
  context.arc(charge.flashX, charge.flashY, radius, 0, Math.PI * 2);
  context.fill();
}
