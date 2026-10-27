import { useState } from "react";
import type { ReactNode } from "react";
import type { HandLandmarker } from "@mediapipe/tasks-vision";
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
import { createHandTracker } from "./input/handTracker";
import type { ExperienceStatus } from "./types/experienceTypes";
import styles from "./App.module.css";

function App() {
  const [status, setStatus] = useState<ExperienceStatus>("welcome");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [handTracker, setHandTracker] = useState<HandLandmarker | null>(null);
  const isExperienceOn = status === "running" || status === "demo";

  async function handleStart() {
    setStatus("loading");

    let stream: MediaStream;
    try {
      stream = await requestCamera();
    } catch (error) {
      setStatus(getCameraErrorStatus(error));
      return;
    }

    try {
      const tracker = await createHandTracker();
      setCameraStream(stream);
      setHandTracker(tracker);
      setStatus("running");
    } catch {
      stopCamera(stream);
      setStatus("error");
    }
  }

  function handleEnd() {
    if (cameraStream) {
      stopCamera(cameraStream);
      setCameraStream(null);
    }

    if (handTracker) {
      handTracker.close();
      setHandTracker(null);
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
            handTracker={handTracker}
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
