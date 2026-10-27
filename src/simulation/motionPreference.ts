// Algumas pessoas sentem enjoo ou tontura com movimento intenso e pedem ao
// sistema operacional para reduzir animações. O navegador expõe esse pedido
// como "prefers-reduced-motion".
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// Multiplica a intensidade dos efeitos: tremor, explosão e flash
export const MOTION_SCALE = prefersReducedMotion ? 0.4 : 1;
