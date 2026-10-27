// Este arquivo roda num Web Worker: uma segunda linha de execução,
// separada da animação. Aqui o MediaPipe pode demorar sem travar as partículas.
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import type {
  DetectorDelegate,
  WorkerRequest,
  WorkerResponse,
} from "../types/trackerTypes";

// A versão aqui precisa ser a mesma do package.json
const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm";
const MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

let handLandmarker: HandLandmarker | null = null;

function reply(message: WorkerResponse) {
  self.postMessage(message);
}

async function startDetector(delegate: DetectorDelegate) {
  try {
    // true = carrega o motor no formato de módulo, o que um worker moderno exige
    const vision = await FilesetResolver.forVisionTasks(WASM_PATH, true);
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_PATH,
        delegate,
      },
      runningMode: "VIDEO",
      numHands: 1,
    });
    reply({ type: "ready" });
  } catch {
    reply({ type: "failed" });
  }
}

// addEventListener em vez de onmessage: o motor do MediaPipe, ao carregar,
// pode trocar o self.onmessage pelo dele e apagar o nosso ouvinte.
self.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;

  if (message.type === "start") {
    startDetector(message.delegate);
    return;
  }

  if (handLandmarker) {
    const detectStart = performance.now();
    const result = handLandmarker.detectForVideo(
      message.frame,
      message.timestamp,
    );
    reply({
      type: "result",
      landmarkList: result.landmarks[0] ?? null,
      detectTime: performance.now() - detectStart,
    });
  }

  message.frame.close(); // libera a memória do quadro
});
