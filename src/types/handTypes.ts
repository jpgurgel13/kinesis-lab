export type Point = {
  x: number;
  y: number;
};

// O formato da mão na tela, para as partículas colidirem com ela
export type HandShape = {
  pointList: Point[]; // os 21 pontos do MediaPipe, já em pixels do canvas
  boneRadius: number; // grossura de cada dedo, em pixels
  palmRadius: number; // raio da palma, em pixels
  minX: number; // retângulo que envolve a mão (teste rápido)
  maxX: number;
  minY: number;
  maxY: number;
};

export type HandSummary = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isVisible: boolean;
  isClosed: boolean;
  shape: HandShape | null; // só existe com a câmera; o mouse é um ponto
};
