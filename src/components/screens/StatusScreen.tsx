import type { ReactNode } from "react";
import { screenTextList } from "../../data/texts";
import { screenMascotList } from "../../data/mascotData";
import type { ExperienceStatus } from "../../types/experienceTypes";
import Mascot from "../ui/Mascot";
import styles from "./StatusScreen.module.css";

type StatusScreenProps = {
  status: ExperienceStatus;
  children: ReactNode;
};

function StatusScreen({ status, children }: StatusScreenProps) {
  const screenText = screenTextList.find((item) => item.status === status);
  const screenMascot = screenMascotList.find((item) => item.status === status);

  if (!screenText || !screenMascot) {
    return null;
  }

  return (
    <section className={styles.screen}>
      <Mascot
        src={screenMascot.image}
        alt={screenText.mascotAlt}
        width={240}
        height={192}
      />
      <h1 className={styles.title}>{screenText.title}</h1>
      <p className={styles.message}>{screenText.message}</p>
      <div className={styles.actions}>{children}</div>
    </section>
  );
}

export default StatusScreen;
