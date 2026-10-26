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
  const companion =
    chargeStep > 0 ? chargeImageList[chargeStep - 1] : restingCompanion;

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
        width={160}
        height={128}
        className={styles.companion}
      />
    </section>
  );
}

export default ExperienceScreen;
