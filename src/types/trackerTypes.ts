import type { Landmark, NormalizedLandmark } from "@mediapipe/tasks-vision";

export type DetectorDelegate = "GPU" | "CPU";

// Uma mão encontrada pelo MediaPipe, nos dois formatos que ele entrega
export type TrackedHand = {
  landmarkList: NormalizedLandmark[]; // na imagem, de 0 a 1 (para posição)
  worldLandmarkList: Landmark[]; // em 3D, em metros (para o formato da mão)
};

// O que a página manda para o worker
export type WorkerRequest =
  | { type: "start"; delegate: DetectorDelegate }
  | { type: "frame"; frame: ImageBitmap; timestamp: number };

// O que o worker manda de volta para a página
export type WorkerResponse =
  | { type: "ready" }
  | { type: "failed" }
  | {
      type: "result";
      trackedHand: TrackedHand | null;
      detectTime: number; // quanto a IA levou lá dentro, em milissegundos
    };

export type HandTracker = {
  worker: Worker;
  delegate: DetectorDelegate;
  isBusy: boolean; // true enquanto o worker analisa um quadro
  sentAt: number; // quando o último quadro foi enviado
  trackedHand: TrackedHand | null; // a última mão encontrada
  lastSeenAt: number; // quando a mão foi vista pela última vez
};
