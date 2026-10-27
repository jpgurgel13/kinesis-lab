import type { Landmark, NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { HandShape, HandSummary, Point } from "../types/handTypes";
import type { TrackedHand } from "../types/trackerTypes";
import { landmarkToCanvas } from "./handTracker";

// Pulso (0) e a base dos quatro dedos (5, 9, 13, 17): o "miolo" da mão.
// Esses pontos quase não se mexem quando os dedos abrem e fecham.
const PALM_POINT_LIST = [0, 5, 9, 13, 17];
const HAND_FOLLOW_SPEED = 27.5; // quão rápido o anel alcança a mão detectada

// Grossura da mão na tela, proporcional ao tamanho da palma (pulso até a base do médio)
const BONE_RADIUS_RATIO = 0.1; // dedos
const PALM_RADIUS_RATIO = 0.6; // palma

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

// Monta o formato da mão. Os pontos chegam só ~12 vezes por segundo, então
// "carregamos" o formato junto com o anel suavizado: cada ponto é deslocado
// pela mesma diferença entre a palma detectada e a posição suavizada da mão.
function buildHandShape(
  rawPointList: Point[],
  rawPalm: Point,
  hand: HandSummary,
): HandShape {
  const offsetX = hand.x - rawPalm.x;
  const offsetY = hand.y - rawPalm.y;
  const pointList = rawPointList.map((point) => ({
    x: point.x + offsetX,
    y: point.y + offsetY,
  }));

  const wrist = pointList[WRIST];
  const middleBase = pointList[MIDDLE_FINGER_BASE];
  const palmSize = Math.hypot(middleBase.x - wrist.x, middleBase.y - wrist.y);
  const boneRadius = palmSize * BONE_RADIUS_RATIO;
  const palmRadius = palmSize * PALM_RADIUS_RATIO;

  let minX = hand.x - palmRadius;
  let maxX = hand.x + palmRadius;
  let minY = hand.y - palmRadius;
  let maxY = hand.y + palmRadius;
  for (const point of pointList) {
    minX = Math.min(minX, point.x - boneRadius);
    maxX = Math.max(maxX, point.x + boneRadius);
    minY = Math.min(minY, point.y - boneRadius);
    maxY = Math.max(maxY, point.y + boneRadius);
  }

  return { pointList, boneRadius, palmRadius, minX, maxX, minY, maxY };
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
    hand.shape = null;
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

  if (!hand.isVisible) {
    // A mão acabou de aparecer: começa direto no lugar certo
    hand.x = palm.x;
    hand.y = palm.y;
    hand.isVisible = true;
  } else {
    // Entre uma detecção e outra, o anel desliza até a mão em vez de pular
    const follow = Math.min(HAND_FOLLOW_SPEED * deltaTime, 1);
    hand.x = hand.x + (palm.x - hand.x) * follow;
    hand.y = hand.y + (palm.y - hand.y) * follow;
  }

  // Qual o formato?
  const rawPointList = trackedHand.landmarkList.map((landmark) =>
    landmarkToCanvas(landmark, video, width, height),
  );
  hand.shape = buildHandShape(rawPointList, palm, hand);
}
