import { useState } from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import StatusScreen from "./components/screens/StatusScreen";
import ExperienceScreen from "./components/screens/ExperienceScreen";
import Button from "./components/ui/Button";
import { buttonText } from "./data/texts";
import type { ExperienceStatus } from "./types/experienceTypes";
import styles from "./App.module.css";

function App() {
  const [status, setStatus] = useState<ExperienceStatus>("welcome");
  const isExperienceOn = status === "running" || status === "demo";

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Header />
      </header>

      <main className={styles.main}>
        {isExperienceOn ? (
          <ExperienceScreen
            isDemo={status === "demo"}
            onEnd={() => setStatus("ended")}
          />
        ) : (
          <StatusScreen status={status}>
            {status === "ended" ? (
              <Button variant="primary" onClick={() => setStatus("welcome")}>
                {buttonText.restart}
              </Button>
            ) : (
              <>
                {/* Etapa 6: antes de começar, o navegador vai pedir a câmera. */}
                <Button variant="primary" onClick={() => setStatus("running")}>
                  {buttonText.start}
                </Button>
                <Button variant="secondary" onClick={() => setStatus("demo")}>
                  {buttonText.demo}
                </Button>
              </>
            )}
          </StatusScreen>
        )}
      </main>

      <footer className={styles.footer}>
        <Footer />
      </footer>
    </div>
  );
}

export default App;
