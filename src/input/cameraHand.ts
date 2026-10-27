import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { HandSummary } from "../types/handTypes";
import { landmarkToCanvas } from "./handTracker";

// Pulso (0) e a base dos quatro dedos (5, 9, 13, 17): o "miolo" da mão.
// Esses pontos quase não se mexem quando os dedos abrem e fecham.
const PALM_POINT_LIST = [0, 5, 9, 13, 17];
const HAND_FOLLOW_SPEED = 27.5; // quão rápido o anel alcança a mão detectada

function getPalmCenter(landmarkList: NormalizedLandmark[]) {
  let sumX = 0;
  let sumY = 0;

  for (const pointIndex of PALM_POINT_LIST) {
    sumX = sumX + landmarkList[pointIndex].x;
    sumY = sumY + landmarkList[pointIndex].y;
  }

  return {
    x: sumX / PALM_POINT_LIST.length,
    y: sumY / PALM_POINT_LIST.length,
  };
}

export function updateHandFromCamera(
  hand: HandSummary,
  landmarkList: NormalizedLandmark[] | null,
  video: HTMLVideoElement,
  width: number,
  height: number,
  deltaTime: number,
) {
  if (!landmarkList) {
    hand.isVisible = false;
    return;
  }

  const palm = landmarkToCanvas(
    getPalmCenter(landmarkList),
    video,
    width,
    height,
  );

  // A mão acabou de aparecer: começa direto no lugar certo
  if (!hand.isVisible) {
    hand.x = palm.x;
    hand.y = palm.y;
    hand.isVisible = true;
    return;
  }

  // Entre uma detecção e outra, o anel desliza até a mão em vez de pular
  const follow = Math.min(HAND_FOLLOW_SPEED * deltaTime, 1);
  hand.x = hand.x + (palm.x - hand.x) * follow;
  hand.y = hand.y + (palm.y - hand.y) * follow;
}
