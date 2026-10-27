import type { HandSummary } from "../types/handTypes";

const HAND_SMOOTHING = 12; // quanto maior, mais rápido a velocidade reage

export function createHandSummary(): HandSummary {
  return {
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    isVisible: false,
    isClosed: false,
    shape: null,
  };
}

export function connectPointerToHand(
  canvas: HTMLCanvasElement,
  hand: HandSummary,
) {
  const handlePointerMove = (event: PointerEvent) => {
    const canvasBox = canvas.getBoundingClientRect();
    hand.x = event.clientX - canvasBox.left;
    hand.y = event.clientY - canvasBox.top;
    hand.isVisible = true;
  };

  const handlePointerDown = () => {
    hand.isClosed = true;
  };

  const handlePointerUp = () => {
    hand.isClosed = false;
  };

  const handlePointerLeave = () => {
    hand.isVisible = false;
    hand.isClosed = false;
  };

  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointerleave", handlePointerLeave);

  return () => {
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointerup", handlePointerUp);
    canvas.removeEventListener("pointerleave", handlePointerLeave);
  };
}

// Para quem usa só o teclado: com o palco focado (Tab), segurar a barra de
// espaço fecha a mão. Se o mouse não estiver no palco, a mão surge no centro.
export function connectKeyboardToHand(
  canvas: HTMLCanvasElement,
  hand: HandSummary,
) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code !== "Space") {
      return;
    }

    event.preventDefault(); // sem isso, a barra de espaço rolaria a página

    if (!hand.isVisible) {
      hand.x = canvas.clientWidth / 2;
      hand.y = canvas.clientHeight / 2;
      hand.isVisible = true;
    }

    hand.isClosed = true;
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.code === "Space") {
      hand.isClosed = false;
    }
  };

  // Se o foco sair do palco no meio da carga, solta a mão
  const handleBlur = () => {
    hand.isClosed = false;
  };

  canvas.addEventListener("keydown", handleKeyDown);
  canvas.addEventListener("keyup", handleKeyUp);
  canvas.addEventListener("blur", handleBlur);

  return () => {
    canvas.removeEventListener("keydown", handleKeyDown);
    canvas.removeEventListener("keyup", handleKeyUp);
    canvas.removeEventListener("blur", handleBlur);
  };
}

export function updateHandVelocity(
  hand: HandSummary,
  previousX: number,
  previousY: number,
  deltaTime: number,
) {
  if (deltaTime === 0) {
    return;
  }

  const measuredVelocityX = (hand.x - previousX) / deltaTime;
  const measuredVelocityY = (hand.y - previousY) / deltaTime;
  const smoothingAmount = Math.min(HAND_SMOOTHING * deltaTime, 1);

  hand.velocityX =
    hand.velocityX + (measuredVelocityX - hand.velocityX) * smoothingAmount;
  hand.velocityY =
    hand.velocityY + (measuredVelocityY - hand.velocityY) * smoothingAmount;
}
