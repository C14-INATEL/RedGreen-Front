import type { CSSProperties, HTMLAttributes } from 'react';
import { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { createGambitCard, type GambitCardInstance } from './GambitCard';
import { GAMBIT_GRID_SIZE } from './GambitGameConfig';
import { preloadGambitCardTextures } from './GambitTextures';
import type { GambitVisualCard } from './GambitTypes';

type GambitBoardProps = Pick<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style'
> & {
  cards: GambitVisualCard[];
  clarividenciaPreviewMode?: boolean;
  interactionLocked?: boolean;
  onCardReveal: (cardId: number) => void;
  onCardRevealAnimationComplete?: (cardId: number) => void;
  selectedCardIds?: number[];
};

const BOARD_FRAME_COLOR = 0x2a1f12;
const BOARD_SURFACE_COLOR = 0x0c2615;
const LOADING_TEXT_COLOR = 0xf0c350;

const destroyChildren = (container: Container) => {
  container.removeChildren().forEach((child) => {
    child.destroy({ children: true });
  });
};

const loadingTextStyle = new TextStyle({
  align: 'center',
  fill: LOADING_TEXT_COLOR,
  fontFamily: 'Press Start 2P',
  fontSize: 14,
  fontWeight: '700',
});

const drawBoardFrame = (
  graphics: Graphics,
  gridX: number,
  gridY: number,
  gridSize: number,
  framePadding: number
) => {
  graphics.clear();
  graphics.beginFill(BOARD_FRAME_COLOR, 0.92);
  graphics.drawRoundedRect(
    gridX - framePadding,
    gridY - framePadding,
    gridSize + framePadding * 2,
    gridSize + framePadding * 2,
    Math.max(12, framePadding * 0.8)
  );
  graphics.endFill();

  graphics.beginFill(BOARD_SURFACE_COLOR, 0.97);
  graphics.drawRoundedRect(
    gridX - Math.round(framePadding * 0.45),
    gridY - Math.round(framePadding * 0.45),
    gridSize + Math.round(framePadding * 0.9),
    gridSize + Math.round(framePadding * 0.9),
    Math.max(8, framePadding * 0.55)
  );
  graphics.endFill();
};

const getBoardLayout = (width: number, height: number) => {
  const boardSize = Math.min(width, height);
  const boardX = Math.round((width - boardSize) / 2);
  const boardY = Math.round((height - boardSize) / 2);
  const outerPadding = Math.max(12, Math.round(boardSize * 0.055));
  const cellGap = Math.max(5, Math.round(boardSize * 0.018));
  const availableSize = boardSize - outerPadding * 2;
  const cellSize = Math.floor(
    (availableSize - cellGap * (GAMBIT_GRID_SIZE - 1)) / GAMBIT_GRID_SIZE
  );
  const gridSize =
    cellSize * GAMBIT_GRID_SIZE + cellGap * (GAMBIT_GRID_SIZE - 1);
  const gridX = Math.round(boardX + (boardSize - gridSize) / 2);
  const gridY = Math.round(boardY + (boardSize - gridSize) / 2);
  const framePadding = Math.max(8, Math.round(cellSize * 0.18));

  return {
    cellGap,
    cellSize,
    framePadding,
    gridSize,
    gridX,
    gridY,
  };
};

export const GambitBoard = ({
  cards,
  clarividenciaPreviewMode = false,
  className,
  interactionLocked = false,
  onCardReveal,
  onCardRevealAnimationComplete,
  selectedCardIds = [],
  style,
}: GambitBoardProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef(cards);
  const clarividenciaPreviewModeRef = useRef(clarividenciaPreviewMode);
  const interactionLockedRef = useRef(interactionLocked);
  const selectedCardIdsRef = useRef(selectedCardIds);
  const onCardRevealAnimationCompleteRef = useRef(
    onCardRevealAnimationComplete
  );
  const onCardRevealRef = useRef(onCardReveal);
  const renderBoardRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onCardRevealRef.current = onCardReveal;
  }, [onCardReveal]);

  useEffect(() => {
    onCardRevealAnimationCompleteRef.current = onCardRevealAnimationComplete;
  }, [onCardRevealAnimationComplete]);

  useEffect(() => {
    clarividenciaPreviewModeRef.current = clarividenciaPreviewMode;
  }, [clarividenciaPreviewMode]);

  useEffect(() => {
    interactionLockedRef.current = interactionLocked;
    renderBoardRef.current?.();
  }, [interactionLocked]);

  useEffect(() => {
    selectedCardIdsRef.current = selectedCardIds;
    renderBoardRef.current?.();
  }, [selectedCardIds]);

  useEffect(() => {
    cardsRef.current = cards;
    renderBoardRef.current?.();
  }, [cards]);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return undefined;
    }

    let app: Application | null = null;
    let root: Container | null = null;
    let frame: Graphics | null = null;
    let loadingLabel: Text | null = null;
    let observer: ResizeObserver | null = null;
    let isDisposed = false;
    let texturesReady = false;

    const cardInstances = new Map<number, GambitCardInstance>();

    const syncCards = () => {
      if (!root || !frame || !app || isDisposed) {
        return;
      }

      const currentRoot = root;

      const width = Math.round(host.clientWidth);
      const height = Math.round(host.clientHeight);

      if (!width || !height) {
        return;
      }

      app.renderer.resize(width, height);

      const layout = getBoardLayout(width, height);

      drawBoardFrame(
        frame,
        layout.gridX,
        layout.gridY,
        layout.gridSize,
        layout.framePadding
      );

      if (!texturesReady) {
        if (loadingLabel) {
          loadingLabel.visible = true;
          loadingLabel.position.set(
            Math.round(width / 2),
            Math.round(height / 2)
          );
        }

        cardInstances.forEach((instance) => {
          currentRoot.removeChild(instance.container);
          instance.destroy();
        });
        cardInstances.clear();
        return;
      }

      if (loadingLabel) {
        loadingLabel.visible = false;
      }

      const activeIds = new Set<number>();

      cardsRef.current.forEach((card, cardIndex) => {
        const row = Math.floor(cardIndex / GAMBIT_GRID_SIZE);
        const column = cardIndex % GAMBIT_GRID_SIZE;
        const x = layout.gridX + column * (layout.cellSize + layout.cellGap);
        const y = layout.gridY + row * (layout.cellSize + layout.cellGap);

        activeIds.add(card.id);

        const nextProps = {
          disabled: interactionLockedRef.current || card.locked,
          effect: card.effect,
          locked: card.locked,
          onClick: () => {
            onCardRevealRef.current(card.id);
          },
          onRevealComplete: () => {
            onCardRevealAnimationCompleteRef.current?.(card.id);
          },
          previewed: card.previewed,
          revealOnClick: !clarividenciaPreviewModeRef.current,
          revealed: card.revealed,
          selected: selectedCardIdsRef.current.includes(card.id),
          size: layout.cellSize,
          value: card.points,
          x,
          y,
        };

        const existingCard = cardInstances.get(card.id);

        if (existingCard) {
          existingCard.update(nextProps);
          return;
        }

        const nextCard = createGambitCard(nextProps);
        cardInstances.set(card.id, nextCard);
        currentRoot.addChild(nextCard.container);
      });

      cardInstances.forEach((instance, cardId) => {
        if (activeIds.has(cardId)) {
          return;
        }

        currentRoot.removeChild(instance.container);
        instance.destroy();
        cardInstances.delete(cardId);
      });
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

    const canvas = nextApp.view as HTMLCanvasElement;
    canvas.style.display = 'block';
    canvas.style.height = '100%';
    canvas.style.imageRendering = 'pixelated';
    canvas.style.width = '100%';

    host.appendChild(canvas);

    root = new Container();
    frame = new Graphics();
    loadingLabel = new Text('CARREGANDO', loadingTextStyle);
    loadingLabel.anchor.set(0.5);
    loadingLabel.resolution = 2;

    root.addChild(frame, loadingLabel);
    nextApp.stage.addChild(root);
    renderBoardRef.current = syncCards;

    observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            syncCards();
          });
    observer?.observe(host);

    syncCards();

    preloadGambitCardTextures()
      .catch(() => undefined)
      .finally(() => {
        if (isDisposed) {
          return;
        }

        texturesReady = true;
        syncCards();
      });

    return () => {
      isDisposed = true;
      renderBoardRef.current = null;
      observer?.disconnect();

      cardInstances.forEach((instance) => {
        instance.destroy();
      });
      cardInstances.clear();

      if (root) {
        destroyChildren(root);
      }

      app?.destroy(true, { children: true });
    };
  }, []);

  const combinedStyle: CSSProperties = {
    ...style,
  };

  return <div className={className} ref={hostRef} style={combinedStyle} />;
};
