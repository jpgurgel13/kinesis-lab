import type { ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  variant: "primary" | "secondary";
  onClick: () => void;
  children: ReactNode;
};

function Button({ variant, onClick, children }: ButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
