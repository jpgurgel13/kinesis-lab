type KinesisLogoProps = {
  size: number;
};

function KinesisLogo({ size }: KinesisLogoProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      <g fill="#F04452">
        <circle cx="148" cy="100" r="11" />
        <circle cx="134" cy="134" r="11" />
        <circle cx="100" cy="148" r="11" />
        <circle cx="66" cy="134" r="11" />
        <circle cx="52" cy="100" r="11" />
        <circle cx="66" cy="66" r="11" />
        <circle cx="100" cy="52" r="11" />
        <circle cx="134" cy="66" r="11" />
      </g>
      <g fill="#3B82F6">
        <circle cx="178" cy="100" r="7" />
        <circle cx="155" cy="155" r="7" />
        <circle cx="100" cy="178" r="7" />
        <circle cx="45" cy="155" r="7" />
        <circle cx="22" cy="100" r="7" />
        <circle cx="45" cy="45" r="7" />
        <circle cx="100" cy="22" r="7" />
        <circle cx="155" cy="45" r="7" />
      </g>
      <circle cx="100" cy="100" r="22" fill="#F04452" />
      <circle cx="100" cy="100" r="9" fill="#FFD6DA" />
    </svg>
  );
}

export default KinesisLogo;
