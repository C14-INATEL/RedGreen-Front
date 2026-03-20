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

const REEL_COUNT = 4;
const REEL_WIDTH_RATIO = 376 / 2200;
const REEL_GAP_RATIO = 232 / 2200;
const REEL_CORNER_RATIO = 0.08;
const REEL_PADDING_RATIO = 0.1;
const MIN_SWITCH_DELAY_MS = 420;
const MAX_SWITCH_DELAY_MS = 980;

type SlotMachineReelsProps = Pick<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style'
>;

type ReelState = {
  baseScale: number;
  currentTextureIndex: number;
  elapsedMs: number;
  reelWidth: number;
  sprite: Sprite;
  switchDelayMs: number;
  viewHeight: number;
};

const getRandomTextureIndex = (excludeIndex?: number) => {
  if (SLOT_TEXTURE_URLS.length <= 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * SLOT_TEXTURE_URLS.length);

  while (excludeIndex !== undefined && nextIndex === excludeIndex) {
    nextIndex = Math.floor(Math.random() * SLOT_TEXTURE_URLS.length);
  }

  return nextIndex;
};

const getNextSwitchDelay = (reelIndex: number) =>
  MIN_SWITCH_DELAY_MS +
  reelIndex * 90 +
  Math.random() * (MAX_SWITCH_DELAY_MS - MIN_SWITCH_DELAY_MS);

const configurePixelArtTexture = (texture: Texture) => {
  texture.baseTexture.mipmap = MIPMAP_MODES.OFF;
  texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
  texture.baseTexture.wrapMode = WRAP_MODES.CLAMP;
  texture.baseTexture.update();

  return texture;
};

const applySpriteTexture = (reel: ReelState, texture: Texture) => {
  reel.sprite.texture = texture;

  const maxWidth = reel.reelWidth * (1 - REEL_PADDING_RATIO * 2);
  const maxHeight = reel.viewHeight * (1 - REEL_PADDING_RATIO * 2);
  const widthScale = maxWidth / texture.width;
  const heightScale = maxHeight / texture.height;
  const nextScale = Math.max(Math.min(widthScale, heightScale), 0.01);

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

const createReels = (width: number, height: number, textures: Texture[]) => {
  const root = new Container();
  const reels: ReelState[] = [];
  const reelWidth = width * REEL_WIDTH_RATIO;
  const reelGap = width * REEL_GAP_RATIO;
  const cornerRadius = Math.min(reelWidth, height) * REEL_CORNER_RATIO;

  for (let reelIndex = 0; reelIndex < REEL_COUNT; reelIndex += 1) {
    const reelFrame = new Container();
    reelFrame.x = reelIndex * (reelWidth + reelGap);

    const mask = new Graphics();
    mask.beginFill(0xffffff);
    mask.drawRoundedRect(0, 0, reelWidth, height, cornerRadius);
    mask.endFill();

    const reelContent = new Container();
    reelContent.mask = mask;

    const reelBackground = new Graphics();
    reelBackground.beginFill(0x0f172a, 0.16);
    reelBackground.drawRoundedRect(0, 0, reelWidth, height, cornerRadius);
    reelBackground.endFill();

    const reelShadow = new Graphics();
    reelShadow.beginFill(0x020617, 0.18);
    reelShadow.drawRoundedRect(
      reelWidth * 0.06,
      height * 0.06,
      reelWidth * 0.88,
      height * 0.88,
      cornerRadius * 0.75
    );
    reelShadow.endFill();

    const gloss = new Graphics();
    gloss.beginFill(0xffffff, 0.08);
    gloss.drawRoundedRect(
      reelWidth * 0.08,
      height * 0.05,
      reelWidth * 0.84,
      height * 0.16,
      cornerRadius * 0.55
    );
    gloss.endFill();

    const currentTextureIndex = getRandomTextureIndex();
    const sprite = new Sprite(textures[currentTextureIndex]);
    sprite.anchor.set(0.5);
    sprite.roundPixels = true;

    const reel: ReelState = {
      baseScale: 1,
      currentTextureIndex,
      elapsedMs: reelIndex * 140,
      reelWidth,
      sprite,
      switchDelayMs: getNextSwitchDelay(reelIndex),
      viewHeight: height,
    };

    applySpriteTexture(reel, textures[currentTextureIndex]);

    reelContent.addChild(reelBackground);
    reelContent.addChild(reelShadow);
    reelContent.addChild(sprite);

    reelFrame.addChild(reelContent);
    reelFrame.addChild(mask);
    reelFrame.addChild(gloss);
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
  reels.forEach((reel, reelIndex) => {
    reel.elapsedMs += deltaMs;

    if (reel.elapsedMs < reel.switchDelayMs) {
      return;
    }

    reel.elapsedMs = 0;
    reel.switchDelayMs = getNextSwitchDelay(reelIndex);
    reel.currentTextureIndex = getRandomTextureIndex(reel.currentTextureIndex);
    applySpriteTexture(reel, textures[reel.currentTextureIndex]);
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
      textures = [];
      lastWidth = 0;
      lastHeight = 0;
      app?.ticker.remove(handleTick);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      if (root) {
        destroyChildren(root);
      }

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
