import type { HandSummary } from "../types/handTypes";
import type { Particle } from "../types/particleTypes";

const PARTICLE_COLOR = "#3b82f6";
const MAX_SPEED = 30;
const MIN_RADIUS = 1;
const MAX_RADIUS = 3;
const FLOW_SPEED = 25; // pixels por segundo
const FLOW_SCALE = 0.004; // quanto menor, mais largas as correntes
const FLOW_CHANGE_SPEED = 0.15; // quanto as correntes mudam com o tempo
const STEERING = 1.5; // quanto as partículas obedecem à corrente
const MIN_LIFESPAN = 1; // segundos
const MAX_LIFESPAN = 15; // segundos
const REPEL_RADIUS = 40; // pixels: maior que o anel, para o efeito começar antes do toque
const REPEL_FORCE = 800; // pixels por segundo, a cada segundo
const DRAG_RADIUS = 100; // pixels: alcance da mão que agita a água
const DRAG_STRENGTH = 4.4; // quanto da velocidade da mão é passado às partículas
const MAX_DRAG_SPEED = 450; // pixels por segundo: limite do empurrão

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
    });
  }

  return particleList;
}
function respawnParticle(particle: Particle, width: number, height: number) {
  particle.x = randomBetween(0, width);
  particle.y = randomBetween(0, height);
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
  deltaTime: number,
  elapsedTime: number,
  width: number,
  height: number,
) {
  const steeringAmount = Math.min(STEERING * deltaTime, 1);

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

    if (hand.isVisible && !hand.isClosed) {
      applyHandDrag(particle, hand, deltaTime);
      applyHandRepulsion(particle, hand, deltaTime);
    }

    particle.x = particle.x + particle.velocityX * deltaTime;
    particle.y = particle.y + particle.velocityY * deltaTime;

    if (particle.x < 0) particle.x = width;
    if (particle.x > width) particle.x = 0;
    if (particle.y < 0) particle.y = height;
    if (particle.y > height) particle.y = 0;

    particle.age = particle.age + deltaTime;
    if (particle.age > particle.lifespan) {
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

export function drawParticleList(
  context: CanvasRenderingContext2D,
  particleList: Particle[],
) {
  context.fillStyle = PARTICLE_COLOR;

  for (const particle of particleList) {
    context.globalAlpha = Math.sin(
      (particle.age / particle.lifespan) * Math.PI,
    );
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }

  context.globalAlpha = 1;
}
