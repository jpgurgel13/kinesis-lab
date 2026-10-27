import { useRef, useState } from "react";
import type { HandLandmarker } from "@mediapipe/tasks-vision";
import { buttonText, experienceText } from "../../data/texts";
import { chargeImageList, companionImage } from "../../data/mascotData";
import Button from "../ui/Button";
import Mascot from "../ui/Mascot";
import styles from "./ExperienceScreen.module.css";
import ParticleCanvas from "../experience/ParticleCanvas";
import CameraBackground from "../experience/CameraBackground";

type ExperienceScreenProps = {
  isDemo: boolean;
  cameraStream: MediaStream | null;
  handTracker: HandLandmarker | null;
  onEnd: () => void;
};

function ExperienceScreen({
  isDemo,
  cameraStream,
  handTracker,
  onEnd,
}: ExperienceScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const modeLabel = isDemo
    ? experienceText.demoMode
    : experienceText.cameraMode;
  const hint = isDemo ? experienceText.demoHint : experienceText.noHandHint;
  const [chargeStep, setChargeStep] = useState(0);

  const restingCompanion = isDemo ? companionImage.demo : companionImage.noHand;
  const isCharging = chargeStep > 0;
  const isFullCharge = chargeStep === chargeImageList.length;
  const companion = isCharging
    ? chargeImageList[chargeStep - 1]
    : restingCompanion;

  let companionClassName = styles.companion;
  if (isCharging) {
    companionClassName += ` ${styles.charging}`;
  }
  if (isFullCharge) {
    companionClassName += ` ${styles.fullCharge}`;
  }

  return (
    <section className={styles.experience} aria-label={modeLabel}>
      <div className={styles.toolbar}>
        <span className={styles.mode}>{modeLabel}</span>
        <Button variant="secondary" onClick={onEnd}>
          {buttonText.end}
        </Button>
      </div>

      <div className={styles.stage}>
        {cameraStream && (
          <CameraBackground stream={cameraStream} videoRef={videoRef} />
        )}
        <ParticleCanvas
          handTracker={handTracker}
          videoRef={videoRef}
          onChargeStepChange={setChargeStep}
        />
        <p className={styles.hint}>{hint}</p>
      </div>

      <Mascot
        src={companion}
        alt=""
        width={240}
        height={192}
        className={companionClassName}
      />
    </section>
  );
}

export default ExperienceScreen;
