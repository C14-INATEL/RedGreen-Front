import type { CSSProperties, HTMLAttributes } from 'react';
import { useEffect, useRef } from 'react';
import {
  Application,
  Assets,
  Container,
  Graphics,
  MIPMAP_MODES,
  SCALE_MODES,
  Sprite,
  Texture,
  WRAP_MODES,
} from 'pixi.js';

const SLOT_TEXTURE_URLS = [
  '/SlotMachine/SpriteSlot2X.png',
  '/SlotMachine/SpriteSlotCheese.png',
  '/SlotMachine/SpriteSlotEgg.png',
  '/SlotMachine/SpriteSlotOrange.png',
  '/SlotMachine/SpriteSlotOranges.png',
  '/SlotMachine/SpriteSlotPig.png',
  '/SlotMachine/SpriteSlotRat.png',
  '/SlotMachine/SpriteSlotWatermelon.png',
] as const;

const SLOT_REEL_CONFIG = {
  reelCount: 4,
  layout: {
    reelWidthRatio: 376 / 2200,
    reelGapRatio: 232 / 2200,
    windowPaddingXRatio: 0.0,
    windowPaddingYRatio: 0.0,
    windowOffsetXRatio: 0,
    windowOffsetYRatio: 0,
    windowCornerRadiusRatio: 0,
  },
  sprite: {
    cropXRatio: 0.08,
    cropYRatio: 0.07,
    coverScale: 0.85,
    offsetXRatio: 0,
    offsetYRatio: 0,
  },
  animation: {
    spinDurationMs: 150,
    minPauseMs: 100,
    maxPauseMs: 250,
  },
} as const;

const REEL_ITEM_OFFSETS = [-1, 0, 1] as const;

type SlotMachineReelsProps = Pick<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style'
>;

type ReelViewport = {
  centerX: number;
  centerY: number;
  cornerRadius: number;
  height: number;
  width: number;
  x: number;
  y: number;
};

type ReelItem = {
  sprite: Sprite;
  textureIndex: number;
};

type ReelState = {
  elapsedMs: number;
  items: ReelItem[];
  pauseMs: number;
  rollDistancePx: number;
  speedPxPerMs: number;
  strip: Container;
  viewport: ReelViewport;
};

const getNextPauseMs = () =>
  SLOT_REEL_CONFIG.animation.minPauseMs +
  Math.random() *
    (SLOT_REEL_CONFIG.animation.maxPauseMs -
      SLOT_REEL_CONFIG.animation.minPauseMs);

const getRandomTextureIndex = (
  textureCount: number,
  excludedIndices: number[] = []
) => {
  const availableIndices = Array.from(
    { length: textureCount },
    (_, index) => index
  ).filter((index) => !excludedIndices.includes(index));

  if (!availableIndices.length) {
    return Math.floor(Math.random() * textureCount);
  }

  return availableIndices[Math.floor(Math.random() * availableIndices.length)];
};

const createDisplayTexture = (texture: Texture) => {
  const insetX = Math.round(
    texture.frame.width * SLOT_REEL_CONFIG.sprite.cropXRatio
  );
  const insetY = Math.round(
    texture.frame.height * SLOT_REEL_CONFIG.sprite.cropYRatio
  );
  const width = Math.max(1, texture.frame.width - insetX * 2);
  const height = Math.max(1, texture.frame.height - insetY * 2);
  const frame = new Rectangle(
    texture.frame.x + insetX,
    texture.frame.y + insetY,
    width,
    height
  );

const configurePixelArtTexture = (texture: Texture) => {
  texture.baseTexture.mipmap = MIPMAP_MODES.OFF;
  texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
  texture.baseTexture.wrapMode = WRAP_MODES.CLAMP;
  texture.baseTexture.update();

  return texture;
};

const applySpriteTexture = (reel: ReelState, texture: Texture) => {
  reel.sprite.texture = texture;

const createViewport = (reelWidth: number, reelHeight: number): ReelViewport => {
  const width =
    reelWidth * (1 - SLOT_REEL_CONFIG.layout.windowPaddingXRatio * 2);
  const height =
    reelHeight * (1 - SLOT_REEL_CONFIG.layout.windowPaddingYRatio * 2);
  const x =
    (reelWidth - width) / 2 +
    reelWidth * SLOT_REEL_CONFIG.layout.windowOffsetXRatio;
  const y =
    (reelHeight - height) / 2 +
    reelHeight * SLOT_REEL_CONFIG.layout.windowOffsetYRatio;

  return {
    centerX: x + width / 2,
    centerY: y + height / 2,
    cornerRadius:
      Math.min(width, height) * SLOT_REEL_CONFIG.layout.windowCornerRadiusRatio,
    height,
    width,
    x,
    y,
  };
};

  reel.baseScale = nextScale;
  reel.sprite.roundPixels = true;
  reel.sprite.scale.set(nextScale);
  reel.sprite.position.set(
    Math.round(reel.reelWidth / 2),
    Math.round(reel.viewHeight / 2)
  );
};

const destroyChildren = (container: Container) => {
  container.removeChildren().forEach((child) => {
    child.destroy({ children: true });
  });
};

const completeSpin = (reel: ReelState, textures: Texture[]) => {
  reel.strip.y = 0;

  const recycledItem = reel.items.pop();

  if (!recycledItem) {
    return;
  }

  reel.items.unshift(recycledItem);

  assignRandomTexture(
    recycledItem,
    textures,
    reel.viewport,
    reel.items.slice(1).map((item) => item.textureIndex)
  );
  syncItemPositions(reel.items, reel.viewport);
  reel.pauseMs = getNextPauseMs();
};

const createReels = (width: number, height: number, textures: Texture[]) => {
  const root = new Container();
  const reels: ReelState[] = [];
  const reelWidth = width * SLOT_REEL_CONFIG.layout.reelWidthRatio;
  const reelGap = width * SLOT_REEL_CONFIG.layout.reelGapRatio;

  for (
    let reelIndex = 0;
    reelIndex < SLOT_REEL_CONFIG.reelCount;
    reelIndex += 1
  ) {
    const reelFrame = new Container();
    reelFrame.x = reelIndex * (reelWidth + reelGap);

    const viewport = createViewport(reelWidth, height);

    const mask = new Graphics();
    mask.beginFill(0xffffff);
    mask.drawRoundedRect(
      viewport.x,
      viewport.y,
      viewport.width,
      viewport.height,
      viewport.cornerRadius
    );
    mask.endFill();

    const strip = new Container();
    strip.mask = mask;

    const currentTextureIndex = getRandomTextureIndex();
    const sprite = new Sprite(textures[currentTextureIndex]);
    sprite.anchor.set(0.5);
    sprite.roundPixels = true;

      return {
        sprite,
        textureIndex: -1,
      };
    });

    items.forEach((item, index) => {
      assignRandomTexture(
        item,
        textures,
        viewport,
        items.slice(0, index).map((existingItem) => existingItem.textureIndex)
      );
      strip.addChild(item.sprite);
    });

    syncItemPositions(items, viewport);

    const reel: ReelState = {
      elapsedMs: 0,
      items,
      pauseMs: getNextPauseMs(),
      rollDistancePx: 0,
      speedPxPerMs: viewport.height / SLOT_REEL_CONFIG.animation.spinDurationMs,
      strip,
      viewport,
    };

    reelFrame.addChild(strip);
    reelFrame.addChild(mask);
    root.addChild(reelFrame);
    reels.push(reel);
  }

  return { reels, root };
};

const updateReels = (
  reels: ReelState[],
  deltaMs: number,
  textures: Texture[]
) => {
  reels.forEach((reel) => {
    if (reel.rollDistancePx > 0) {
      const step = Math.min(reel.rollDistancePx, reel.speedPxPerMs * deltaMs);

      reel.strip.y += step;
      reel.rollDistancePx -= step;

      if (reel.rollDistancePx <= 0) {
        completeSpin(reel, textures);
      }

      return;
    }

    reel.elapsedMs += deltaMs;

    if (reel.elapsedMs < reel.pauseMs) {
      return;
    }

    reel.elapsedMs = 0;
    reel.rollDistancePx = reel.viewport.height;
  });
};

export const SlotMachineReels = ({
  className,
  style,
}: SlotMachineReelsProps) => {
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
    let reels: ReelState[] = [];
    let textures: Texture[] = [];
    let frameId: number | null = null;
    let lastWidth = 0;
    let lastHeight = 0;

    const rebuild = () => {
      if (!app || !root || !textures.length) {
        return false;
      }

      const width = host.clientWidth;
      const height = host.clientHeight;

      if (!width || !height) {
        return false;
      }

      if (width === lastWidth && height === lastHeight && reels.length) {
        return true;
      }

      lastWidth = width;
      lastHeight = height;
      app.renderer.resize(width, height);
      destroyChildren(root);

      const scene = createReels(width, height, textures);
      root.addChild(scene.root);
      reels = scene.reels;

      return true;
    };

    const ensureInitialized = () => {
      frameId = null;

      if (isDisposed || rebuild()) {
        return;
      }

      frameId = window.requestAnimationFrame(ensureInitialized);
    };

    const scheduleInitialization = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(ensureInitialized);
    };

    const handleTick = () => {
      if (!app || !reels.length || !textures.length) {
        return;
      }

      updateReels(reels, app.ticker.deltaMS, textures);
    };

    const setup = async () => {
      const loadedTextureMap = await Assets.load<Texture>([
        ...SLOT_TEXTURE_URLS,
      ]);

      if (isDisposed) {
        return;
      }

      textures = SLOT_TEXTURE_URLS.map((url) =>
        configurePixelArtTexture(loadedTextureMap[url])
      );

      const nextApp = new Application({
        antialias: false,
        autoDensity: true,
        backgroundAlpha: 0,
        height: 1,
        resolution: 1,
        width: 1,
      });

      if (isDisposed) {
        textures.forEach((texture) => {
          texture.destroy(false);
        });
        nextApp.destroy(true, { children: true });
        return;
      }

      app = nextApp;

      const canvas = nextApp.view as HTMLCanvasElement;
      canvas.style.display = 'block';
      canvas.style.height = '100%';
      canvas.style.imageRendering = 'pixelated';
      canvas.style.width = '100%';

      host.appendChild(canvas);

      root = new Container();
      nextApp.stage.addChild(root);

      observer =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver(() => {
              if (!rebuild()) {
                scheduleInitialization();
              }
            });

      [host, host.parentElement]
        .filter((target): target is HTMLElement => target !== null)
        .forEach((target) => {
          observer?.observe(target);
        });

      if (!rebuild()) {
        scheduleInitialization();
      }

      nextApp.ticker.add(handleTick);
    };

    void setup();

    return () => {
      isDisposed = true;
      observer?.disconnect();
      reels = [];
      lastWidth = 0;
      lastHeight = 0;
      app?.ticker.remove(handleTick);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      if (root) {
        destroyChildren(root);
      }

      textures.forEach((texture) => {
        texture.destroy(false);
      });
      textures = [];
      app?.destroy(true, { children: true });
    };
  }, []);

  const combinedStyle: CSSProperties = {
    ...style,
  };

  return (
    <div
      className={className ? `overflow-hidden ${className}` : 'overflow-hidden'}
      ref={hostRef}
      style={combinedStyle}
    />
  );
};
