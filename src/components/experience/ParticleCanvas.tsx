import { experienceText } from "../../data/texts";
import styles from "./ParticleCanvas.module.css";

function ParticleCanvas() {
  return (
    <canvas
      className={styles.canvas}
      role="img"
      aria-label={experienceText.canvasLabel}
    />
  );
}

export default ParticleCanvas;
