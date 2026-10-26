import type { ChargeState } from "../types/chargeTypes";
import type { HandSummary } from "../types/handTypes";

const CHARGE_DURATION = 3; // segundos para a carga encher
const MIN_BURST_POWER = 0.05; // abaixo disso, soltar não explode (um clique rápido)
const FLASH_DURATION = 0.6; // segundos que o flash leva para sumir

export function createChargeState(): ChargeState {
  return {
    level: 0,
    burstPower: 0,
    flashLevel: 0,
    flashX: 0,
    flashY: 0,
  };
}

export function updateCharge(
  charge: ChargeState,
  hand: HandSummary,
  deltaTime: number,
) {
  charge.flashLevel = Math.max(
    charge.flashLevel - deltaTime / FLASH_DURATION,
    0,
  );

  if (hand.isVisible && hand.isClosed) {
    charge.level = Math.min(charge.level + deltaTime / CHARGE_DURATION, 1);
    charge.burstPower = 0;
    return;
  }

  if (charge.level >= MIN_BURST_POWER) {
    charge.burstPower = charge.level;
    charge.flashLevel = charge.level;
    charge.flashX = hand.x;
    charge.flashY = hand.y;
  } else {
    charge.burstPower = 0;
  }

  charge.level = 0;
}
