import type { Particle } from "../types/particleTypes";

const PARTICLE_COLOR = "#3b82f6";
const MAX_SPEED = 30;
const MIN_RADIUS = 1;
const MAX_RADIUS = 3;
const FLOW_SPEED = 25; // pixels por segundo
const FLOW_SCALE = 0.004; // quanto menor, mais largas as correntes
const FLOW_CHANGE_SPEED = 0.15; // quanto as correntes mudam com o tempo
const STEERING = 1.5; // quanto as partículas obedecem à corrente

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
    particleList.push({
      x: randomBetween(0, width),
      y: randomBetween(0, height),
      velocityX: randomBetween(-MAX_SPEED, MAX_SPEED),
      velocityY: randomBetween(-MAX_SPEED, MAX_SPEED),
      radius: randomBetween(MIN_RADIUS, MAX_RADIUS),
      speedFactor: randomBetween(0.6, 1.4),
    });
  }

  return particleList;
}

function getFlowAngle(x: number, y: number, time: number) {
  const waveX = Math.sin(x * FLOW_SCALE + time * FLOW_CHANGE_SPEED);
  const waveY = Math.cos(y * FLOW_SCALE - time * FLOW_CHANGE_SPEED);

  return (waveX + waveY) * Math.PI;
}

export function updateParticleList(
  particleList: Particle[],
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

    particle.x = particle.x + particle.velocityX * deltaTime;
    particle.y = particle.y + particle.velocityY * deltaTime;

    if (particle.x < 0) particle.x = width;
    if (particle.x > width) particle.x = 0;
    if (particle.y < 0) particle.y = height;
    if (particle.y > height) particle.y = 0;
  }
}

export function drawParticleList(
  context: CanvasRenderingContext2D,
  particleList: Particle[],
) {
  context.fillStyle = PARTICLE_COLOR;

  for (const particle of particleList) {
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }
}
