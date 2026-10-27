import type { ChargeState } from "../types/chargeTypes";
import type { HandSummary } from "../types/handTypes";
import { getHeatColor } from "./heatColor";
import { MOTION_SCALE } from "./motionPreference";

const MARKER_RADIUS = 40; // pixels: anel da mão aberta
const MARKER_COLOR = "rgba(147, 197, 253, 0.45)"; // azul claro translúcido
const CHARGE_RING_RADIUS = 60; // pixels: arco de carga, logo por fora do núcleo do enxame
const PULSE_SPEED = 12; // velocidade da pulsação com a carga cheia
const PULSE_SIZE = 4; // pixels que o indicador cresce ao pulsar
const FLASH_RADIUS = 260; // pixels: tamanho do flash com carga cheia

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

  context.strokeStyle = MARKER_COLOR;
  context.lineWidth = 1.5;

  context.beginPath();
  context.arc(hand.x, hand.y, MARKER_RADIUS, 0, Math.PI * 2);
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
  const radius = CHARGE_RING_RADIUS + pulse;
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
  const brightness = charge.flashLevel * MOTION_SCALE;
  gradient.addColorStop(0, `rgba(255, 214, 218, ${brightness})`);
  gradient.addColorStop(1, "rgba(240, 68, 82, 0)");

  context.fillStyle = gradient;
  context.beginPath();
  context.arc(charge.flashX, charge.flashY, radius, 0, Math.PI * 2);
  context.fill();
}
