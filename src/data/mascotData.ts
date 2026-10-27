import presenterImage from "../assets/mascot/presenter.png";
import calibratingImage from "../assets/mascot/calibrating.png";
import cameraDeniedImage from "../assets/mascot/camera-denied.png";
import cameraMissingImage from "../assets/mascot/camera-missing.png";
import genericErrorImage from "../assets/mascot/generic-error.png";
import endedImage from "../assets/mascot/ended.png";
import showHandImage from "../assets/mascot/show-hand.png";
import driftImage from "../assets/mascot/drift.png";
import demoModeImage from "../assets/mascot/demo-mode.png";
import chargeStep1Image from "../assets/mascot/charge-step-1.png";
import chargeStep2Image from "../assets/mascot/charge-step-2.png";
import chargeStep3Image from "../assets/mascot/charge-step-3.png";
import chargeStep4Image from "../assets/mascot/charge-step-4.png";
import type { ScreenMascot } from "../types/experienceTypes";

export const screenMascotList: ScreenMascot[] = [
  { status: "welcome", image: presenterImage },
  { status: "loading", image: calibratingImage },
  { status: "cameraDenied", image: cameraDeniedImage },
  { status: "cameraMissing", image: cameraMissingImage },
  { status: "error", image: genericErrorImage },
  { status: "ended", image: endedImage },
];

export const companionImage = {
  noHand: showHandImage,
  handVisible: driftImage,
  demo: demoModeImage,
};

// Uma pose para cada quarto da carga: 25%, 50%, 75% e 100%
export const chargeImageList = [
  chargeStep1Image,
  chargeStep2Image,
  chargeStep3Image,
  chargeStep4Image,
];
