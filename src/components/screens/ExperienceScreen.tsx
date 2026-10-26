import { buttonText, experienceText } from "../../data/texts";
import { companionImage } from "../../data/mascotData";
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
  const companion = isDemo ? companionImage.demo : companionImage.noHand;

  return (
    <section className={styles.experience} aria-label={modeLabel}>
      <div className={styles.toolbar}>
        <span className={styles.mode}>{modeLabel}</span>
        <Button variant="secondary" onClick={onEnd}>
          {buttonText.end}
        </Button>
      </div>

      <div className={styles.stage}>
        <ParticleCanvas />
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
