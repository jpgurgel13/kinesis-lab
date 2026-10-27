import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

// A versão aqui precisa ser a mesma do package.json
const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm";
const MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export async function createHandTracker() {
  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_PATH,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 1,
  });
}

// Converte um ponto do vídeo (de 0 a 1) para pixels do canvas,
// desfazendo o espelho e o corte do object-fit: cover.
export function landmarkToCanvas(
  landmark: NormalizedLandmark,
  video: HTMLVideoElement,
  width: number,
  height: number,
) {
  const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
  const drawnWidth = video.videoWidth * scale;
  const drawnHeight = video.videoHeight * scale;
  const offsetX = (width - drawnWidth) / 2;
  const offsetY = (height - drawnHeight) / 2;

  return {
    x: offsetX + (1 - landmark.x) * drawnWidth,
    y: offsetY + landmark.y * drawnHeight,
  };
}
