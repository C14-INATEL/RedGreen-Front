import { useEffect, useRef } from 'react';
import { AnimatedSprite, Application, Container } from 'pixi.js';
import {
  MINEFIELD_PARTICLE_ANIMATION_FRAMES,
  preloadMinefieldParticleTextures,
} from './minefieldTextures';

type BackgroundParticlesProps = {
  alphaMultiplier?: number;
  className?: string;
  maxParticles?: number;
  spawnIntervalMs?: number;
  speedMultiplier?: number;
  tremorMultiplier?: number;
};

type ParticleState = {
  alphaBase: number;
  baseX: number;
  driftAmplitude: number;
  driftOffset: number;
  driftSpeed: number;
  fadeStartProgress: number;
  scale: number;
  sprite: AnimatedSprite;
  tremorAmplitudeX: number;
  tremorAmplitudeY: number;
  tremorOffset: number;
  tremorSpeed: number;
  verticalSpeed: number;
  y: number;
};

const DEFAULT_MAX_PARTICLES = 32;
const DEFAULT_SPAWN_INTERVAL_MS = 180;
const DEFAULT_ALPHA_MULTIPLIER = 1;
const DEFAULT_SPEED_MULTIPLIER = 1;
const DEFAULT_TREMOR_MULTIPLIER = 1;
const MIN_PARTICLE_SCALE = 0.45;
const MAX_PARTICLE_SCALE = 0.95;
const MIN_PARTICLE_ALPHA = 0.24;
const MAX_PARTICLE_ALPHA = 0.62;
const MIN_VERTICAL_SPEED = 28;
const MAX_VERTICAL_SPEED = 52;
const MIN_DRIFT_AMPLITUDE = 10;
const MAX_DRIFT_AMPLITUDE = 28;
const MIN_DRIFT_SPEED = 1.4;
const MAX_DRIFT_SPEED = 3.2;
const MIN_FADE_START_PROGRESS = 0.52;
const MAX_FADE_START_PROGRESS = 0.76;
const MIN_PARTICLE_ANIMATION_SPEED = 0.08;
const MAX_PARTICLE_ANIMATION_SPEED = 0.18;
const MIN_TREMOR_AMPLITUDE_X = 1.2;
const MAX_TREMOR_AMPLITUDE_X = 3.6;
const MIN_TREMOR_AMPLITUDE_Y = 0.4;
const MAX_TREMOR_AMPLITUDE_Y = 1.8;
const MIN_TREMOR_SPEED = 14;
const MAX_TREMOR_SPEED = 28;

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const createParticleSprite = () => {
  const particleSprite = AnimatedSprite.fromFrames(
    MINEFIELD_PARTICLE_ANIMATION_FRAMES
  );

  particleSprite.anchor.set(0.5);
  particleSprite.loop = true;
  particleSprite.roundPixels = true;
  particleSprite.visible = false;
  particleSprite.play();

  return particleSprite;
};

const createParticleState = (): ParticleState => ({
  alphaBase: 0,
  baseX: 0,
  driftAmplitude: 0,
  driftOffset: 0,
  driftSpeed: 0,
  fadeStartProgress: 0,
  scale: 1,
  sprite: createParticleSprite(),
  tremorAmplitudeX: 0,
  tremorAmplitudeY: 0,
  tremorOffset: 0,
  tremorSpeed: 0,
  verticalSpeed: 0,
  y: 0,
});

export const BackgroundParticles = ({
  alphaMultiplier = DEFAULT_ALPHA_MULTIPLIER,
  className,
  maxParticles = DEFAULT_MAX_PARTICLES,
  spawnIntervalMs = DEFAULT_SPAWN_INTERVAL_MS,
  speedMultiplier = DEFAULT_SPEED_MULTIPLIER,
  tremorMultiplier = DEFAULT_TREMOR_MULTIPLIER,
}: BackgroundParticlesProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return undefined;
    }

    let app: Application | null = null;
    let root: Container | null = null;
    let observer: ResizeObserver | null = null;
    let isDisposed = false;
    let texturesReady = false;
    let width = 0;
    let height = 0;
    let spawnAccumulator = 0;

    // Reuso de sprites: mantemos um pool fixo para evitar criacao/destruicao constante.
    const activeParticles: ParticleState[] = [];
    const inactiveParticles: ParticleState[] = Array.from(
      { length: maxParticles },
      () => createParticleState()
    );

    const syncSize = () => {
      if (!app) {
        return;
      }

      width = Math.round(host.clientWidth);
      height = Math.round(host.clientHeight);

      if (!width || !height) {
        return;
      }

      app.renderer.resize(width, height);
    };

    const recycleParticle = (particle: ParticleState) => {
      particle.sprite.visible = false;
      particle.sprite.stop();
      particle.sprite.gotoAndPlay(0);
      root?.removeChild(particle.sprite);
      const particleIndex = activeParticles.indexOf(particle);

      if (particleIndex >= 0) {
        activeParticles.splice(particleIndex, 1);
      }

      inactiveParticles.push(particle);
    };

    const spawnParticle = () => {
      if (!root || !texturesReady || !width || !height) {
        return;
      }

      const nextParticle = inactiveParticles.pop();

      if (!nextParticle) {
        return;
      }

      const scale = randomBetween(MIN_PARTICLE_SCALE, MAX_PARTICLE_SCALE);
      const startX = randomBetween(0, width);
      const startY = height + randomBetween(8, Math.max(18, height * 0.08));

      nextParticle.baseX = startX;
      nextParticle.y = startY;
      nextParticle.scale = scale;
      nextParticle.alphaBase = randomBetween(
        MIN_PARTICLE_ALPHA,
        MAX_PARTICLE_ALPHA
      ) * alphaMultiplier;
      nextParticle.verticalSpeed = randomBetween(
        MIN_VERTICAL_SPEED,
        MAX_VERTICAL_SPEED
      ) * speedMultiplier;
      nextParticle.driftAmplitude = randomBetween(
        MIN_DRIFT_AMPLITUDE,
        MAX_DRIFT_AMPLITUDE
      );
      nextParticle.driftSpeed = randomBetween(
        MIN_DRIFT_SPEED,
        MAX_DRIFT_SPEED
      );
      nextParticle.driftOffset = randomBetween(0, Math.PI * 2);
      nextParticle.tremorAmplitudeX =
        randomBetween(MIN_TREMOR_AMPLITUDE_X, MAX_TREMOR_AMPLITUDE_X) *
        tremorMultiplier;
      nextParticle.tremorAmplitudeY =
        randomBetween(MIN_TREMOR_AMPLITUDE_Y, MAX_TREMOR_AMPLITUDE_Y) *
        tremorMultiplier;
      nextParticle.tremorOffset = randomBetween(0, Math.PI * 2);
      nextParticle.tremorSpeed = randomBetween(
        MIN_TREMOR_SPEED,
        MAX_TREMOR_SPEED
      );
      nextParticle.fadeStartProgress = randomBetween(
        MIN_FADE_START_PROGRESS,
        MAX_FADE_START_PROGRESS
      );

      nextParticle.sprite.animationSpeed = randomBetween(
        MIN_PARTICLE_ANIMATION_SPEED,
        MAX_PARTICLE_ANIMATION_SPEED
      );
      nextParticle.sprite.alpha = nextParticle.alphaBase;
      nextParticle.sprite.position.set(startX, startY);
      nextParticle.sprite.scale.set(scale);
      nextParticle.sprite.visible = true;
      nextParticle.sprite.play();
      nextParticle.sprite.gotoAndPlay(
        Math.floor(Math.random() * MINEFIELD_PARTICLE_ANIMATION_FRAMES.length)
      );

      root.addChild(nextParticle.sprite);
      activeParticles.push(nextParticle);
    };

    const updateParticles = (deltaTime: number) => {
      if (!texturesReady || !width || !height) {
        return;
      }

      const deltaSeconds = deltaTime / 60;

      // Spawn progressivo: gera particulas aos poucos para o fundo parecer vivo sem picos.
      spawnAccumulator += deltaSeconds * 1000;

      while (
        spawnAccumulator >= spawnIntervalMs &&
        activeParticles.length < maxParticles
      ) {
        spawnAccumulator -= spawnIntervalMs;
        spawnParticle();
      }

      for (let index = activeParticles.length - 1; index >= 0; index -= 1) {
        const particle = activeParticles[index];

        // Movimento vertical lento e variado para criar profundidade.
        particle.y -= particle.verticalSpeed * deltaSeconds;

        const traveledDistance = height - particle.y;
        const travelProgress = height > 0 ? traveledDistance / height : 0;

        // Zigue-zague suave com seno: cada particula recebe fase/amplitude proprias.
        const driftX =
          Math.sin(
            particle.driftOffset + travelProgress * Math.PI * particle.driftSpeed
          ) * particle.driftAmplitude;
        const tremorPhase =
          particle.tremorOffset + travelProgress * particle.tremorSpeed;
        const tremorX = Math.sin(tremorPhase * 2.2) * particle.tremorAmplitudeX;
        const tremorY = Math.cos(tremorPhase * 1.7) * particle.tremorAmplitudeY;

        particle.sprite.x = particle.baseX + driftX + tremorX;
        particle.sprite.y = particle.y + tremorY;

        // Fade out progressivo perto do topo, sem sumir de forma abrupta.
        const fadeProgress =
          travelProgress <= particle.fadeStartProgress
            ? 1
            : Math.max(
                0,
                1 -
                  (travelProgress - particle.fadeStartProgress) /
                    (1 - particle.fadeStartProgress)
              );

        particle.sprite.alpha = particle.alphaBase * fadeProgress;

        if (
          particle.sprite.alpha <= 0.02 ||
          particle.y < -particle.sprite.height ||
          particle.sprite.x < -particle.sprite.width * 2 ||
          particle.sprite.x > width + particle.sprite.width * 2
        ) {
          recycleParticle(particle);
        }
      }
    };

    const nextApp = new Application({
      antialias: false,
      autoDensity: true,
      backgroundAlpha: 0,
      height: 1,
      resolution: 1,
      width: 1,
    });

    if (isDisposed) {
      nextApp.destroy(true, { children: true });
      return undefined;
    }

    app = nextApp;
    root = new Container();
    nextApp.stage.addChild(root);

    const canvas = nextApp.view as HTMLCanvasElement;
    canvas.style.display = 'block';
    canvas.style.height = '100%';
    canvas.style.imageRendering = 'pixelated';
    canvas.style.width = '100%';
    host.appendChild(canvas);

    syncSize();

    app.ticker.add(updateParticles);

    observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            syncSize();
          });
    observer?.observe(host);

    preloadMinefieldParticleTextures()
      .catch(() => undefined)
      .finally(() => {
        if (isDisposed) {
          return;
        }

        texturesReady = true;

        for (
          let index = 0;
          index < Math.min(Math.ceil(maxParticles * 0.4), maxParticles);
          index += 1
        ) {
          spawnParticle();
        }
      });

    return () => {
      isDisposed = true;
      observer?.disconnect();

      app?.ticker.remove(updateParticles);

      root?.destroy({ children: true });
      app?.destroy(true, { children: true });
    };
  }, [
    alphaMultiplier,
    maxParticles,
    spawnIntervalMs,
    speedMultiplier,
    tremorMultiplier,
  ]);

  return (
    <div
      className={className}
      ref={hostRef}
      style={{ pointerEvents: 'none' }}
    />
  );
};
