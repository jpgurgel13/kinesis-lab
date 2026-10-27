import type {
  DetectorDelegate,
  HandTracker,
  WorkerRequest,
  WorkerResponse,
} from "../types/trackerTypes";

// Se um quadro passar disso sem resposta, consideramos que a GPU travou
const STALL_TIMEOUT = 2000; // milissegundos
const FRAME_WIDTH = 320; // pixels: largura da foto enviada ao worker
const STATS_INTERVAL = 2000; // milissegundos entre cada relatório no Console

// Medição de desempenho, só durante o desenvolvimento (npm run dev)
const stats = { count: 0, totalTime: 0, totalDetectTime: 0, startedAt: 0 };

function recordStats(responseTime: number, detectTime: number) {
  if (!import.meta.env.DEV) {
    return;
  }

  const now = performance.now();
  if (stats.startedAt === 0) {
    stats.startedAt = now;
  }

  stats.count = stats.count + 1;
  stats.totalTime = stats.totalTime + responseTime;
  stats.totalDetectTime = stats.totalDetectTime + detectTime;

  const elapsed = now - stats.startedAt;
  if (elapsed >= STATS_INTERVAL) {
    const perSecond = (stats.count / elapsed) * 1000;
    const averageTime = stats.totalTime / stats.count;
    const averageDetectTime = stats.totalDetectTime / stats.count;
    console.info(
      `Kinesis: ${perSecond.toFixed(1)} detecções/s | ida e volta: ${averageTime.toFixed(0)} ms | só a IA: ${averageDetectTime.toFixed(0)} ms`,
    );
    stats.count = 0;
    stats.totalTime = 0;
    stats.totalDetectTime = 0;
    stats.startedAt = now;
  }
}

// Liga um worker novo e espera o MediaPipe ficar pronto lá dentro
function startWorker(delegate: DetectorDelegate) {
  return new Promise<Worker>((resolve, reject) => {
    const worker = new Worker(new URL("./handWorker.ts", import.meta.url), {
      type: "module",
    });

    worker.addEventListener(
      "message",
      (event: MessageEvent<WorkerResponse>) => {
        if (event.data.type === "ready") {
          resolve(worker);
        } else if (event.data.type === "failed") {
          worker.terminate();
          reject(new Error("O detector de mãos não carregou"));
        }
      },
    );

    worker.addEventListener("error", () => {
      worker.terminate();
      reject(new Error("O worker não iniciou"));
    });

    const startMessage: WorkerRequest = { type: "start", delegate };
    worker.postMessage(startMessage);
  });
}

// Guarda cada resposta do worker no tracker
function listenForResults(tracker: HandTracker) {
  tracker.worker.addEventListener(
    "message",
    (event: MessageEvent<WorkerResponse>) => {
      if (event.data.type === "result") {
        tracker.landmarkList = event.data.landmarkList;
        tracker.isBusy = false;
        recordStats(performance.now() - tracker.sentAt, event.data.detectTime);
      }
    },
  );
}

// Tenta a GPU (mais rápida). Se ela não carregar, usa a CPU.
export async function createHandTracker() {
  let delegate: DetectorDelegate = "GPU";
  let worker: Worker;

  try {
    worker = await startWorker("GPU");
  } catch {
    delegate = "CPU";
    worker = await startWorker("CPU");
  }

  const tracker: HandTracker = {
    worker,
    delegate,
    isBusy: false,
    sentAt: 0,
    landmarkList: null,
  };
  listenForResults(tracker);
  console.info(`Kinesis: detector de mãos usando ${delegate}`);

  return tracker;
}

// Plano B: a GPU travou no meio do caminho, então troca para a CPU
async function switchToCpu(tracker: HandTracker) {
  tracker.delegate = "CPU"; // marca logo, para não trocar duas vezes
  tracker.worker.terminate();

  try {
    tracker.worker = await startWorker("CPU");
    listenForResults(tracker);
    tracker.isBusy = false;
    console.info("Kinesis: a GPU travou, detector trocado para CPU");
  } catch {
    // sem detector: a experiência continua, só sem a mão
  }
}

// Tira uma "foto" do vídeo e manda para o worker analisar.
// Se ele ainda estiver ocupado com o quadro anterior, pula este.
export async function sendVideoFrame(
  tracker: HandTracker,
  video: HTMLVideoElement,
  timestamp: number,
) {
  if (tracker.isBusy) {
    const waitingTime = performance.now() - tracker.sentAt;
    if (waitingTime > STALL_TIMEOUT && tracker.delegate === "GPU") {
      switchToCpu(tracker);
    }
    return;
  }

  tracker.isBusy = true;
  tracker.sentAt = performance.now();

  try {
    // O MediaPipe reduz a imagem por dentro de qualquer jeito,
    // então mandar uma foto menor só economiza transporte.
    const frameHeight = Math.round(
      (FRAME_WIDTH * video.videoHeight) / video.videoWidth,
    );
    const frame = await createImageBitmap(video, {
      resizeWidth: FRAME_WIDTH,
      resizeHeight: frameHeight,
    });
    const frameMessage: WorkerRequest = { type: "frame", frame, timestamp };
    tracker.worker.postMessage(frameMessage, [frame]);
  } catch {
    tracker.isBusy = false;
  }
}

export function closeHandTracker(tracker: HandTracker) {
  tracker.worker.terminate();
}

// Converte um ponto do vídeo (de 0 a 1) para pixels do canvas,
// desfazendo o espelho e o corte do object-fit: cover.
export function landmarkToCanvas(
  landmark: { x: number; y: number },
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
