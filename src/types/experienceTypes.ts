export type ExperienceStatus =
  | "welcome"
  | "loading"
  | "running"
  | "demo"
  | "cameraDenied"
  | "cameraMissing"
  | "error"
  | "ended";

export type ScreenText = {
  status: ExperienceStatus;
  title: string;
  message: string;
  mascotAlt: string;
};

export type ScreenMascot = {
  status: ExperienceStatus;
  image: string;
};
