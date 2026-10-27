import { useState } from "react";
import type { ReactNode } from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import StatusScreen from "./components/screens/StatusScreen";
import ExperienceScreen from "./components/screens/ExperienceScreen";
import Button from "./components/ui/Button";
import { buttonText } from "./data/texts";
import {
  getCameraErrorStatus,
  requestCamera,
  stopCamera,
} from "./input/camera";
import type { ExperienceStatus } from "./types/experienceTypes";
import styles from "./App.module.css";

function App() {
  const [status, setStatus] = useState<ExperienceStatus>("welcome");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const isExperienceOn = status === "running" || status === "demo";

  async function handleStart() {
    setStatus("loading");

    try {
      const stream = await requestCamera();
      setCameraStream(stream);
      setStatus("running");
    } catch (error) {
      setStatus(getCameraErrorStatus(error));
    }
  }

  function handleEnd() {
    if (cameraStream) {
      stopCamera(cameraStream);
      setCameraStream(null);
    }

    setStatus("ended");
  }

  let statusActions: ReactNode = null;

  if (status === "ended") {
    statusActions = (
      <Button variant="primary" onClick={() => setStatus("welcome")}>
        {buttonText.restart}
      </Button>
    );
  } else if (status !== "loading") {
    statusActions = (
      <>
        <Button variant="primary" onClick={handleStart}>
          {buttonText.start}
        </Button>
        <Button variant="secondary" onClick={() => setStatus("demo")}>
          {buttonText.demo}
        </Button>
      </>
    );
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Header />
      </header>

      <main className={styles.main}>
        {isExperienceOn ? (
          <ExperienceScreen
            isDemo={status === "demo"}
            cameraStream={cameraStream}
            onEnd={handleEnd}
          />
        ) : (
          <StatusScreen status={status}>{statusActions}</StatusScreen>
        )}
      </main>

      <footer className={styles.footer}>
        <Footer />
      </footer>
    </div>
  );
}

export default App;
