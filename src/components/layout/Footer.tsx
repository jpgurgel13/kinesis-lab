import { footerText } from "../../data/texts";
import styles from "./Footer.module.css";

const PORTFOLIO_URL = "https://jpgurgel-portfolio.vercel.app/";

function Footer() {
  return (
    <div className={styles.footer}>
      <p className={styles.text}>
        {footerText.signature}{" "}
        <a
          className={styles.link}
          href={PORTFOLIO_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {footerText.author}
        </a>
      </p>
    </div>
  );
}

export default Footer;
