const COLD_COLOR = [59, 130, 246]; // azul #3b82f6
const HOT_COLOR = [240, 68, 82]; // vermelho #f04452
const HEAT_COLOR_STEPS = 24;

function mixChannel(cold: number, hot: number, heat: number) {
  return Math.round(cold + (hot - cold) * heat);
}

function createHeatColorList() {
  const heatColorList: string[] = [];

  for (let step = 0; step < HEAT_COLOR_STEPS; step++) {
    const heat = step / (HEAT_COLOR_STEPS - 1);
    const red = mixChannel(COLD_COLOR[0], HOT_COLOR[0], heat);
    const green = mixChannel(COLD_COLOR[1], HOT_COLOR[1], heat);
    const blue = mixChannel(COLD_COLOR[2], HOT_COLOR[2], heat);
    heatColorList.push(`rgb(${red}, ${green}, ${blue})`);
  }

  return heatColorList;
}

const heatColorList = createHeatColorList();

export function getHeatColor(heat: number) {
  const step = Math.round(heat * (HEAT_COLOR_STEPS - 1));
  return heatColorList[step];
}
