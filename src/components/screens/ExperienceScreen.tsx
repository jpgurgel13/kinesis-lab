import { useState } from "react";
import { buttonText, experienceText } from "../../data/texts";
import { chargeImageList, companionImage } from "../../data/mascotData";
import Button from "../ui/Button";
import Mascot from "../ui/Mascot";
import styles from "./ExperienceScreen.module.css";
import ParticleCanvas from "../experience/ParticleCanvas";
type ExperienceScreenProps = {
  isDemo: boolean;
  onEnd: () => void;
};

function ExperienceScreen({ isDemo, onEnd }: ExperienceScreenProps) {
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
        <ParticleCanvas onChargeStepChange={setChargeStep} />
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
