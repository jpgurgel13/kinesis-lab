import type { ExperienceStatus } from "../types/experienceTypes";

// Pede a câmera ao navegador. O navegador mostra a janelinha de permissão
// e a função espera a resposta da pessoa.
export async function requestCamera() {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: false,
  });
}

// Traduz o erro do navegador para uma das telas de estado.
export function getCameraErrorStatus(error: unknown): ExperienceStatus {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "cameraDenied";
    }

    if (
      error.name === "NotFoundError" ||
      error.name === "OverconstrainedError"
    ) {
      return "cameraMissing";
    }
  }

  return "error";
}

// Desliga a câmera de verdade (a luzinha do notebook apaga).
export function stopCamera(stream: MediaStream) {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}
