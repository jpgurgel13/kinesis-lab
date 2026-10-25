import KinesisLogo from "./KinesisLogo";
import styles from "./Header.module.css";

function Header() {
  return (
    <div className={styles.header}>
      <p className={styles.brand}>
        <KinesisLogo size={36} />
        <span className={styles.name}>Kinesis</span>
        <span className={styles.lab}>LAB</span>
      </p>
    </div>
  );
}

export default Header;
