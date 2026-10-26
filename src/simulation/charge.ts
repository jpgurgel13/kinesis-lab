import type { ChargeState } from "../types/chargeTypes";
import type { HandSummary } from "../types/handTypes";

const CHARGE_DURATION = 4; // segundos para a carga encher

export function createChargeState(): ChargeState {
  return { level: 0 };
}

export function updateCharge(
  charge: ChargeState,
  hand: HandSummary,
  deltaTime: number,
) {
  if (hand.isVisible && hand.isClosed) {
    charge.level = Math.min(charge.level + deltaTime / CHARGE_DURATION, 1);
  } else {
    charge.level = 0;
  }
}
