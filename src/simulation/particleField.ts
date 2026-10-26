import type { Particle } from "../types/particleTypes";

const PARTICLE_COLOR = "#3b82f6";
const MAX_SPEED = 30; // pixels por segundo
const MIN_RADIUS = 1;
const MAX_RADIUS = 3;

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
    });
  }

  return particleList;
}

export function updateParticleList(
  particleList: Particle[],
  deltaTime: number,
  width: number,
  height: number,
) {
  for (const particle of particleList) {
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
