import type { ChargeState } from "../types/chargeTypes";
import type { HandSummary } from "../types/handTypes";
import type { Particle } from "../types/particleTypes";
import { getHeatColor } from "./heatColor";

const MAX_SPEED = 40;
const MIN_RADIUS = 1;
const MAX_RADIUS = 3;
const FLOW_SPEED = 25; // pixels por segundo
const FLOW_SCALE = 0.004; // quanto menor, mais largas as correntes
const FLOW_CHANGE_SPEED = 0.15; // quanto as correntes mudam com o tempo
const STEERING = 1.5; // quanto as partículas obedecem à corrente
const MIN_LIFESPAN = 5.5; // segundos
const MAX_LIFESPAN = 15; // segundos
const REPEL_RADIUS = 40; // pixels: maior que o anel, para o efeito começar antes do toque
const REPEL_FORCE = 800; // pixels por segundo, a cada segundo
const DRAG_RADIUS = 100; // pixels: alcance da mão que agita a água
const DRAG_STRENGTH = 6; // quanto da velocidade da mão é passado às partículas
const MAX_DRAG_SPEED = 500; // pixels por segundo: limite do empurrão
const ATTRACT_RADIUS = 400; // pixels: alcance da mão fechada
const ATTRACT_FORCE = 900; // pixels por segundo, a cada segundo
const CORE_RADIUS = 45; // pixels: o núcleo onde as partículas se acumulam
const CORE_FORCE = 1500; // empurrão para fora do núcleo, para não virarem um ponto só
const HEAT_SPEED = 4; // quanto a cor muda por segundo
const AGITATION = 950; // quanto as partículas quentes tremem
const BURST_RADIUS = 500; // pixels: alcance da explosão
const BURST_FORCE = 1100; // pixels por segundo: velocidade dada pela explosão com carga cheia
const BURST_SPREAD = 1.4; // radianos: quanto cada direção pode desviar

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function createParticleList(
  count: number,
  width: number,
  height: number,
): Particle[] {
  const particleList: Particle[] = [];
  for (let index = 0; index < count; index++) {
    const lifespan = randomBetween(MIN_LIFESPAN, MAX_LIFESPAN);

    particleList.push({
      x: randomBetween(0, width),
      y: randomBetween(0, height),
      velocityX: randomBetween(-MAX_SPEED, MAX_SPEED),
      velocityY: randomBetween(-MAX_SPEED, MAX_SPEED),
      radius: randomBetween(MIN_RADIUS, MAX_RADIUS),
      speedFactor: randomBetween(0.6, 1.4),
      age: randomBetween(0, lifespan),
      lifespan,
      heat: 0,
    });
  }

  return particleList;
}
function respawnParticle(particle: Particle, width: number, height: number) {
  particle.x = randomBetween(0, width);
  particle.y = randomBetween(0, height);
  particle.velocityX = 0;
  particle.velocityY = 0;
  particle.heat = 0;
  particle.age = 0;
}
function getFlowAngle(x: number, y: number, time: number) {
  const waveX = Math.sin(x * FLOW_SCALE + time * FLOW_CHANGE_SPEED);
  const waveY = Math.cos(y * FLOW_SCALE - time * FLOW_CHANGE_SPEED);

  return (waveX + waveY) * Math.PI;
}

export function updateParticleList(
  particleList: Particle[],
  hand: HandSummary,
  charge: ChargeState,
  deltaTime: number,
  elapsedTime: number,
  width: number,
  height: number,
) {
  const steeringAmount = Math.min(STEERING * deltaTime, 1);
  const heatAmount = Math.min(HEAT_SPEED * deltaTime, 1);

  for (const particle of particleList) {
    const flowAngle = getFlowAngle(particle.x, particle.y, elapsedTime);
    const flowSpeed = FLOW_SPEED * particle.speedFactor;
    const targetVelocityX = Math.cos(flowAngle) * flowSpeed;
    const targetVelocityY = Math.sin(flowAngle) * flowSpeed;

    particle.velocityX =
      particle.velocityX +
      (targetVelocityX - particle.velocityX) * steeringAmount;
    particle.velocityY =
      particle.velocityY +
      (targetVelocityY - particle.velocityY) * steeringAmount;

    let targetHeat = 0;

    if (charge.burstPower > 0) {
      applyBurst(particle, charge);
    }

    if (hand.isVisible && hand.isClosed) {
      applyHandAttraction(particle, hand, charge.level, deltaTime);
      targetHeat = getTargetHeat(particle, hand, charge.level);
    } else if (hand.isVisible) {
      applyHandDrag(particle, hand, deltaTime);
      applyHandRepulsion(particle, hand, deltaTime);
    }

    particle.heat = particle.heat + (targetHeat - particle.heat) * heatAmount;
    particle.velocityX =
      particle.velocityX +
      randomBetween(-1, 1) * AGITATION * particle.heat * deltaTime;
    particle.velocityY =
      particle.velocityY +
      randomBetween(-1, 1) * AGITATION * particle.heat * deltaTime;

    particle.x = particle.x + particle.velocityX * deltaTime;
    particle.y = particle.y + particle.velocityY * deltaTime;

    particle.age = particle.age + deltaTime;

    const isOutsideCanvas =
      particle.x < 0 ||
      particle.x > width ||
      particle.y < 0 ||
      particle.y > height;

    if (isOutsideCanvas || particle.age > particle.lifespan) {
      respawnParticle(particle, width, height);
    }
  }
}

function applyHandRepulsion(
  particle: Particle,
  hand: HandSummary,
  deltaTime: number,
) {
  const distanceX = particle.x - hand.x;
  const distanceY = particle.y - hand.y;
  const distance = Math.hypot(distanceX, distanceY);

  if (distance === 0 || distance > REPEL_RADIUS) {
    return;
  }

  const directionX = distanceX / distance;
  const directionY = distanceY / distance;
  const strength = (1 - distance / REPEL_RADIUS) * REPEL_FORCE;

  particle.velocityX = particle.velocityX + directionX * strength * deltaTime;
  particle.velocityY = particle.velocityY + directionY * strength * deltaTime;
}

function applyHandDrag(
  particle: Particle,
  hand: HandSummary,
  deltaTime: number,
) {
  const distanceX = particle.x - hand.x;
  const distanceY = particle.y - hand.y;
  const distance = Math.hypot(distanceX, distanceY);

  if (distance > DRAG_RADIUS) {
    return;
  }

  let handVelocityX = hand.velocityX;
  let handVelocityY = hand.velocityY;
  const handSpeed = Math.hypot(handVelocityX, handVelocityY);

  if (handSpeed > MAX_DRAG_SPEED) {
    handVelocityX = (handVelocityX / handSpeed) * MAX_DRAG_SPEED;
    handVelocityY = (handVelocityY / handSpeed) * MAX_DRAG_SPEED;
  }

  const closeness = 1 - distance / DRAG_RADIUS;
  const dragAmount = Math.min(DRAG_STRENGTH * closeness * deltaTime, 1);

  particle.velocityX =
    particle.velocityX + (handVelocityX - particle.velocityX) * dragAmount;
  particle.velocityY =
    particle.velocityY + (handVelocityY - particle.velocityY) * dragAmount;
}

function applyHandAttraction(
  particle: Particle,
  hand: HandSummary,
  chargeLevel: number,
  deltaTime: number,
) {
  const distanceX = hand.x - particle.x;
  const distanceY = hand.y - particle.y;
  const distance = Math.hypot(distanceX, distanceY);

  if (distance === 0 || distance > ATTRACT_RADIUS) {
    return;
  }

  const directionX = distanceX / distance;
  const directionY = distanceY / distance;
  const closeness = 1 - distance / ATTRACT_RADIUS;
  const strength = closeness * ATTRACT_FORCE * (0.4 + 0.6 * chargeLevel);

  particle.velocityX = particle.velocityX + directionX * strength * deltaTime;
  particle.velocityY = particle.velocityY + directionY * strength * deltaTime;

  if (distance < CORE_RADIUS) {
    const corePush = (1 - distance / CORE_RADIUS) * CORE_FORCE;
    particle.velocityX = particle.velocityX - directionX * corePush * deltaTime;
    particle.velocityY = particle.velocityY - directionY * corePush * deltaTime;
  }
}

function getTargetHeat(
  particle: Particle,
  hand: HandSummary,
  chargeLevel: number,
) {
  const distance = Math.hypot(hand.x - particle.x, hand.y - particle.y);

  if (distance > ATTRACT_RADIUS) {
    return 0;
  }

  const closeness = 1 - distance / ATTRACT_RADIUS;
  return Math.min(chargeLevel * (0.5 + closeness), 1);
}

function applyBurst(particle: Particle, charge: ChargeState) {
  const distanceX = particle.x - charge.flashX;
  const distanceY = particle.y - charge.flashY;
  const distance = Math.hypot(distanceX, distanceY);

  if (distance > BURST_RADIUS) {
    return;
  }

  const angle =
    Math.atan2(distanceY, distanceX) +
    randomBetween(-BURST_SPREAD, BURST_SPREAD);
  const closeness = 1 - distance / BURST_RADIUS;
  const impulse = charge.burstPower * BURST_FORCE * (0.3 + 0.7 * closeness);

  particle.velocityX = particle.velocityX + Math.cos(angle) * impulse;
  particle.velocityY = particle.velocityY + Math.sin(angle) * impulse;
  particle.heat = Math.max(particle.heat, charge.burstPower * closeness);
}

export function drawParticleList(
  context: CanvasRenderingContext2D,
  particleList: Particle[],
) {
  for (const particle of particleList) {
    const lifeAlpha = Math.sin((particle.age / particle.lifespan) * Math.PI);
    context.globalAlpha = Math.max(lifeAlpha, particle.heat);
    context.fillStyle = getHeatColor(particle.heat);
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }

  context.globalAlpha = 1;
}
