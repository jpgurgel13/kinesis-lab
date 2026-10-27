import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type DetectorDelegate = "GPU" | "CPU";

// O que a página manda para o worker
export type WorkerRequest =
  | { type: "start"; delegate: DetectorDelegate }
  | { type: "frame"; frame: ImageBitmap; timestamp: number };

// O que o worker manda de volta para a página
export type WorkerResponse =
  | { type: "ready" }
  | { type: "failed" }
  | { type: "result"; landmarkList: NormalizedLandmark[] | null };

export type HandTracker = {
  worker: Worker;
  delegate: DetectorDelegate;
  isBusy: boolean; // true enquanto o worker analisa um quadro
  sentAt: number; // quando o último quadro foi enviado
  landmarkList: NormalizedLandmark[] | null; // a última mão encontrada
};
