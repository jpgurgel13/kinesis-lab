// Todos os textos da interface ficam aqui.
// Para a versão em inglês, basta traduzir este arquivo.
import type { ScreenText } from "../types/experienceTypes";

export const screenTextList: ScreenText[] = [
  {
    status: "welcome",
    title: "Boas-vindas ao laboratório",
    message: "Feche a mão para carregar. Abra para liberar.",
    mascotAlt: "Aranha-Chip apontando com uma varinha",
  },
  {
    status: "loading",
    title: "Calibrando o laboratório…",
    message: "Preparando a câmera e o detector de mãos.",
    mascotAlt: "Aranha-Chip de óculos, calibrando os instrumentos",
  },
  {
    status: "cameraDenied",
    title: "Sem câmera, sem magia",
    message:
      "Libere o acesso nas configurações do navegador ou experimente o modo demonstração.",
    mascotAlt: "Aranha-Chip triste ao lado de uma câmera riscada",
  },
  {
    status: "cameraMissing",
    title: "Nenhuma câmera encontrada",
    message: "Conecte uma câmera ou experimente o modo demonstração.",
    mascotAlt: "Aranha-Chip com um ponto de interrogação na tela",
  },
  {
    status: "error",
    title: "Algo saiu do previsto",
    message: "Recarregue a página para tentar de novo.",
    mascotAlt: "Aranha-Chip com a tela chiando",
  },
  {
    status: "ended",
    title: "Laboratório em repouso",
    message: "Obrigado por experimentar o Kinesis Lab.",
    mascotAlt: "Aranha-Chip dormindo",
  },
];

export const experienceText = {
  cameraMode: "Câmera",
  canvasLabel: "Partículas de luz que reagem ao movimento",
  demoMode: "Demonstração",
  noHandHint: "Mostre a mão para a câmera",
  demoHint:
    "Mova o mouse para agitar as partículas. Segure o clique (ou a barra de espaço) para carregar e solte para liberar.",
  handFoundStatus: "Mão detectada.",
  handLostStatus: "Nenhuma mão na câmera.",
  chargingStatus: "Carregando:",
  fullChargeStatus: "Carga cheia. Solte para liberar.",
  demoCanvasLabel:
    "Partículas de luz que reagem ao movimento. Segure a barra de espaço para carregar e solte para liberar.",
};

export const buttonText = {
  start: "Iniciar",
  demo: "Modo demonstração",
  end: "Encerrar",
  restart: "Começar de novo",
};

export const footerText = {
  signature: "por",
  author: "jpgurgel",
};
