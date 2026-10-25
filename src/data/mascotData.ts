import presenterImage from "../assets/mascot/presenter.png";
import calibratingImage from "../assets/mascot/calibrating.png";
import cameraDeniedImage from "../assets/mascot/camera-denied.png";
import cameraMissingImage from "../assets/mascot/camera-missing.png";
import genericErrorImage from "../assets/mascot/generic-error.png";
import endedImage from "../assets/mascot/ended.png";
import showHandImage from "../assets/mascot/show-hand.png";
import demoModeImage from "../assets/mascot/demo-mode.png";
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
  demo: demoModeImage,
};
