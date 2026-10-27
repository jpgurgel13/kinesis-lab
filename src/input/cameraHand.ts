import type { Landmark, NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { HandSummary } from "../types/handTypes";
import type { TrackedHand } from "../types/trackerTypes";
import { landmarkToCanvas } from "./handTracker";

// Pulso (0) e a base dos quatro dedos (5, 9, 13, 17): o "miolo" da mão.
// Esses pontos quase não se mexem quando os dedos abrem e fecham.
const PALM_POINT_LIST = [0, 5, 9, 13, 17];
const HAND_FOLLOW_SPEED = 27.5; // quão rápido o anel alcança a mão detectada

// Pontos usados para saber se a mão está aberta ou fechada
const WRIST = 0;
const MIDDLE_FINGER_BASE = 9;
const FINGERTIP_LIST = [8, 12, 16, 20]; // indicador, médio, anelar e mindinho

// Duas réguas diferentes evitam que a mão "pisque" entre aberta e fechada
// quando está no meio do caminho (histerese)
const CLOSE_BELOW = 1.1; // abaixo disso, a mão aberta passa a fechada (punho: ~0,9)
const OPEN_ABOVE = 1.3; // acima disso, a mão fechada passa a aberta (relaxada: ~1,4)

function getDistance3d(start: Landmark, end: Landmark) {
  return Math.hypot(end.x - start.x, end.y - start.y, end.z - start.z);
}

// Quão longe as pontas dos dedos estão do pulso, medido em "palmas".
// Medido: punho fechado ~0,9 | mão aberta relaxada ~1,4
function getHandOpenness(worldLandmarkList: Landmark[]) {
  const wrist = worldLandmarkList[WRIST];
  const palmSize = getDistance3d(wrist, worldLandmarkList[MIDDLE_FINGER_BASE]);

  let totalDistance = 0;
  for (const fingertipIndex of FINGERTIP_LIST) {
    totalDistance =
      totalDistance + getDistance3d(wrist, worldLandmarkList[fingertipIndex]);
  }

  const averageDistance = totalDistance / FINGERTIP_LIST.length;
  return averageDistance / palmSize;
}

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
  trackedHand: TrackedHand | null,
  video: HTMLVideoElement,
  width: number,
  height: number,
  deltaTime: number,
) {
  if (!trackedHand) {
    hand.isVisible = false;
    hand.isClosed = false;
    return;
  }

  // Aberta ou fechada?
  const openness = getHandOpenness(trackedHand.worldLandmarkList);
  if (hand.isClosed && openness > OPEN_ABOVE) {
    hand.isClosed = false;
  } else if (!hand.isClosed && openness < CLOSE_BELOW) {
    hand.isClosed = true;
  }

  // Onde está?
  const palm = landmarkToCanvas(
    getPalmCenter(trackedHand.landmarkList),
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
