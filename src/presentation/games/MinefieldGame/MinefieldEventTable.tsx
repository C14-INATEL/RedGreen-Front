import { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Sprite, Texture } from 'pixi.js';
import {
  type MinefieldTableType,
  getMinefieldTableTheme,
} from './MinefieldTableConfig';
import {
  getMinefieldTableTexture,
  preloadMinefieldTableTextures,
} from './MinefieldTextures';
import type { RewardTableState } from '../cardReward/types/CardReward';

type MinefieldEventTableViewport = {
  centerX: number;
  centerY: number;
  height: number;
  width: number;
};

type MinefieldEventTableProps = {
  className?: string;
  onTransitionSettled?: () => void;
  tableState: RewardTableState;
  transitionDurationMs?: number;
  viewport: MinefieldEventTableViewport | null;
};

type TableSceneAnimationState = {
  elapsedMs: number;
  tableState: RewardTableState;
};

const DEFAULT_TRANSITION_DURATION_MS = 720;
const TABLE_RENDER_SCALE_X = 1.18;
const TABLE_RENDER_SCALE_Y = 1.15;
const TABLE_ENTRY_START_OFFSET = 84;
const TABLE_EXIT_END_OFFSET = 120;
const SCENE_SHAKE_X = 7;
const SCENE_SHAKE_Y = 4;
const IMPACT_FLASH_MAX_ALPHA = 0.2;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

const easeInCubic = (value: number) => value * value * value;

const easeOutBack = (value: number) => {
  const overshoot = 1.16;
  const overshootScale = overshoot + 1;

  return (
    1 +
    overshootScale * Math.pow(value - 1, 3) +
    overshoot * Math.pow(value - 1, 2)
  );
};

const drawImpactFlash = (
  graphics: Graphics,
  screenWidth: number,
  screenHeight: number
) => {
  graphics.clear();
  graphics.beginFill(0xffffff, 1);
  graphics.drawRect(0, 0, screenWidth, screenHeight);
  graphics.endFill();
};

export const MinefieldEventTable = ({
  className,
  onTransitionSettled,
  tableState,
  transitionDurationMs = DEFAULT_TRANSITION_DURATION_MS,
  viewport,
}: MinefieldEventTableProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const onTransitionSettledRef = useRef(onTransitionSettled);
  const renderSceneRef = useRef<(() => void) | null>(null);
  const tableStateRef = useRef(tableState);
  const transitionDurationRef = useRef(transitionDurationMs);
  const viewportRef = useRef(viewport);

  useEffect(() => {
    onTransitionSettledRef.current = onTransitionSettled;
  }, [onTransitionSettled]);

  useEffect(() => {
    tableStateRef.current = tableState;
    renderSceneRef.current?.();
  }, [tableState]);

  useEffect(() => {
    transitionDurationRef.current = transitionDurationMs;
  }, [transitionDurationMs]);

  useEffect(() => {
    viewportRef.current = viewport;
    renderSceneRef.current?.();
  }, [viewport]);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return undefined;
    }

    let app: Application | null = null;
    let sceneRoot: Container | null = null;
    let tableLayer: Container | null = null;
    let baseTable: Sprite | null = null;
    let incomingTable: Sprite | null = null;
    let impactFlash: Graphics | null = null;
    let observer: ResizeObserver | null = null;
    let isDisposed = false;
    let texturesReady = false;
    let screenWidth = 0;
    let screenHeight = 0;
    let animationState: TableSceneAnimationState | null = null;
    let activeTransitionId: string | null = null;
    let settledTransitionId: string | null = null;

    const getCurrentViewport = () => viewportRef.current;

    const resetSceneTransform = () => {
      if (!sceneRoot) {
        return;
      }

      sceneRoot.position.set(0, 0);
      sceneRoot.scale.set(1);
    };

    const applyTableLayout = (
      tableSprite: Sprite,
      tableViewport: MinefieldEventTableViewport
    ) => {
      tableSprite.anchor.set(0.5);
      // A mesa pode crescer visualmente sem mexer no grid/cartas do modal,
      // porque o layout interativo continua no DOM e o Pixi desenha so o fundo.
      tableSprite.width = tableViewport.width * TABLE_RENDER_SCALE_X;
      tableSprite.height = tableViewport.height * TABLE_RENDER_SCALE_Y;
      tableSprite.roundPixels = true;
    };

    const resetTableSpriteVisualState = (tableSprite: Sprite) => {
      tableSprite.alpha = 1;
      tableSprite.tint = 0xffffff;
      tableSprite.visible = true;
    };

    const applyTableTexture = (
      tableSprite: Sprite,
      tableType: MinefieldTableType
    ) => {
      tableSprite.texture = getMinefieldTableTexture(tableType);
      tableSprite.roundPixels = true;
      tableSprite.tint = 0xffffff;
      tableSprite.alpha = 1;
    };

    const warmTableTextures = () => {
      if (!baseTable || !incomingTable) {
        return;
      }

      // O flash verde acontecia porque a mesa incoming ainda podia aparecer
      // no primeiro frame usando estado/textura provisoria do sprite.
      // Aqui deixamos as duas texturas resolvidas e aplicadas antes da animacao.
      applyTableTexture(baseTable, tableStateRef.current.currentTable);
      applyTableTexture(incomingTable, 'bad');
      incomingTable.visible = false;
    };

    const syncIdleScene = () => {
      const tableViewport = getCurrentViewport();

      if (
        !texturesReady ||
        !tableViewport ||
        !baseTable ||
        !incomingTable ||
        !impactFlash
      ) {
        return;
      }

      applyTableLayout(baseTable, tableViewport);
      applyTableLayout(incomingTable, tableViewport);

      applyTableTexture(baseTable, tableStateRef.current.currentTable);
      baseTable.position.set(
        Math.round(tableViewport.centerX),
        Math.round(tableViewport.centerY)
      );
      resetTableSpriteVisualState(baseTable);
      incomingTable.visible = false;
      // O flash branco vinha daqui: o layer de impacto podia existir por 1 frame
      // antes de o estado idle zerar sua opacidade. Mantemos invisivel por padrao.
      impactFlash.alpha = 0;
      impactFlash.visible = false;
      activeTransitionId = null;
      animationState = null;
      resetSceneTransform();
    };

    const startTransition = (nextTableState: RewardTableState) => {
      const tableViewport = getCurrentViewport();

      if (
        !tableViewport ||
        !baseTable ||
        !incomingTable ||
        !impactFlash ||
        !texturesReady ||
        !nextTableState.incomingTable ||
        !nextTableState.transitionId ||
        activeTransitionId === nextTableState.transitionId
      ) {
        return;
      }

      const currentImpactFlash = impactFlash;

      animationState = {
        elapsedMs: 0,
        tableState: nextTableState,
      };
      activeTransitionId = nextTableState.transitionId;

      // Antes a mesa nova era desenhada no mesmo retangulo do modal.
      // Aqui cada mesa ganha seu proprio sprite e posicao na cena inteira.
      applyTableLayout(baseTable, tableViewport);
      applyTableLayout(incomingTable, tableViewport);

      applyTableTexture(baseTable, nextTableState.currentTable);
      baseTable.position.set(
        Math.round(tableViewport.centerX),
        Math.round(tableViewport.centerY)
      );
      resetTableSpriteVisualState(baseTable);

      applyTableTexture(incomingTable, nextTableState.incomingTable);
      incomingTable.position.set(
        Math.round(
          screenWidth + tableViewport.width / 2 + TABLE_ENTRY_START_OFFSET
        ),
        Math.round(tableViewport.centerY)
      );
      resetTableSpriteVisualState(incomingTable);
      currentImpactFlash.alpha = 0;
      currentImpactFlash.visible = false;

      resetSceneTransform();
    };

    const renderScene = () => {
      if (
        !app ||
        !sceneRoot ||
        !tableLayer ||
        !baseTable ||
        !incomingTable ||
        !impactFlash
      ) {
        return;
      }

      const currentImpactFlash = impactFlash;

      screenWidth = Math.max(1, Math.round(host.clientWidth));
      screenHeight = Math.max(1, Math.round(host.clientHeight));
      app.renderer.resize(screenWidth, screenHeight);
      drawImpactFlash(currentImpactFlash, screenWidth, screenHeight);

      const nextTableState = tableStateRef.current;

      if (!texturesReady) {
        baseTable.visible = false;
        incomingTable.visible = false;
        currentImpactFlash.alpha = 0;
        currentImpactFlash.visible = false;
        return;
      }

      if (
        nextTableState.isTransitioning &&
        nextTableState.transitionId &&
        settledTransitionId !== nextTableState.transitionId &&
        activeTransitionId !== nextTableState.transitionId
      ) {
        startTransition(nextTableState);
        return;
      }

      if (!animationState) {
        syncIdleScene();
      }
    };

    const updateTransition = (deltaFrames: number) => {
      const tableViewport = getCurrentViewport();

      if (
        !animationState ||
        !tableViewport ||
        !baseTable ||
        !incomingTable ||
        !impactFlash ||
        !sceneRoot ||
        !screenWidth
      ) {
        return;
      }

      animationState.elapsedMs += deltaFrames * (1000 / 60);

      const progress = clamp(
        animationState.elapsedMs / transitionDurationRef.current,
        0,
        1
      );
      const incomingPhase = clamp(progress / 0.54, 0, 1);
      const settlePhase = clamp((progress - 0.54) / 0.46, 0, 1);
      const impactPhase = clamp((progress - 0.46) / 0.16, 0, 1);
      const outgoingPhase = clamp((progress - 0.52) / 0.48, 0, 1);

      const enteringTheme = getMinefieldTableTheme(
        animationState.tableState.incomingTable ??
          animationState.tableState.currentTable
      );
      const centerX = tableViewport.centerX;
      const centerY = tableViewport.centerY;
      const renderedTableWidth = tableViewport.width * TABLE_RENDER_SCALE_X;
      const enteringStartX =
        screenWidth + renderedTableWidth / 2 + TABLE_ENTRY_START_OFFSET;
      const enteringImpactX =
        centerX - renderedTableWidth * 0.05 - enteringTheme.impactPushOffset;
      const exitingStartX = centerX;
      const exitingTargetX =
        -renderedTableWidth / 2 - TABLE_EXIT_END_OFFSET - screenWidth * 0.04;

      const incomingX =
        progress < 0.54
          ? enteringStartX +
            (enteringImpactX - enteringStartX) * easeOutCubic(incomingPhase)
          : enteringImpactX +
            (centerX - enteringImpactX) * easeOutBack(settlePhase);

      const outgoingX =
        progress < 0.52
          ? exitingStartX
          : exitingStartX +
            (exitingTargetX - exitingStartX) * easeInCubic(outgoingPhase);

      // A colisao acontece na cena inteira. A mesa nova vem de fora da viewport
      // e empurra a antiga para alem da borda esquerda, sem clipping do modal.
      baseTable.position.set(Math.round(outgoingX), Math.round(centerY));
      incomingTable.position.set(Math.round(incomingX), Math.round(centerY));

      const shakeDecay = 1 - impactPhase;
      const shakeX =
        impactPhase > 0
          ? Math.round(Math.sin(impactPhase * 28) * SCENE_SHAKE_X * shakeDecay)
          : 0;
      const shakeY =
        impactPhase > 0
          ? Math.round(Math.cos(impactPhase * 22) * SCENE_SHAKE_Y * shakeDecay)
          : 0;
      const bounceWave = Math.sin(settlePhase * Math.PI);
      const bounceAmount = bounceWave * (1 - settlePhase) * 0.018;

      sceneRoot.position.set(shakeX, shakeY);
      sceneRoot.scale.set(1 + bounceAmount * 0.3, 1 - bounceAmount);

      const flashProgress = clamp((progress - 0.48) / 0.12, 0, 1);
      impactFlash.tint = enteringTheme.impactFlashTint;
      impactFlash.visible = flashProgress > 0;
      impactFlash.alpha = impactFlash.visible
        ? IMPACT_FLASH_MAX_ALPHA * (1 - flashProgress)
        : 0;

      if (progress < 1) {
        return;
      }

      const settledTable =
        animationState.tableState.incomingTable ??
        animationState.tableState.currentTable;

      settledTransitionId = animationState.tableState.transitionId;
      activeTransitionId = null;
      animationState = null;

      applyTableTexture(baseTable, settledTable);
      baseTable.position.set(Math.round(centerX), Math.round(centerY));
      resetTableSpriteVisualState(baseTable);
      incomingTable.visible = false;
      impactFlash.alpha = 0;
      impactFlash.visible = false;
      resetSceneTransform();

      onTransitionSettledRef.current?.();
    };

    const nextApp = new Application({
      antialias: false,
      autoDensity: true,
      backgroundAlpha: 0,
      backgroundColor: 0x000000,
      height: 1,
      resolution: 1,
      width: 1,
    });

    if (isDisposed) {
      nextApp.destroy(true, { children: true });
      return undefined;
    }

    app = nextApp;
    sceneRoot = new Container();
    tableLayer = new Container();
    baseTable = new Sprite(Texture.EMPTY);
    incomingTable = new Sprite(Texture.EMPTY);
    impactFlash = new Graphics();
    impactFlash.alpha = 0;
    impactFlash.visible = false;

    tableLayer.addChild(baseTable, incomingTable);
    sceneRoot.addChild(tableLayer, impactFlash);
    nextApp.stage.addChild(sceneRoot);
    renderSceneRef.current = renderScene;

    const canvas = nextApp.view as HTMLCanvasElement;
    canvas.style.background = 'transparent';
    canvas.style.display = 'block';
    canvas.style.height = '100%';
    canvas.style.imageRendering = 'pixelated';
    canvas.style.width = '100%';
    host.appendChild(canvas);

    nextApp.ticker.add(updateTransition);

    observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            renderScene();
          });
    observer?.observe(host);

    renderScene();

    preloadMinefieldTableTextures()
      .catch(() => undefined)
      .finally(() => {
        if (isDisposed) {
          return;
        }

        texturesReady = true;
        warmTableTextures();
        renderScene();
      });

    return () => {
      isDisposed = true;
      renderSceneRef.current = null;
      observer?.disconnect();
      nextApp.ticker.remove(updateTransition);
      sceneRoot?.destroy({ children: true });
      nextApp.destroy(true, { children: true });
    };
  }, []);

  return <div className={className} ref={hostRef} />;
};
