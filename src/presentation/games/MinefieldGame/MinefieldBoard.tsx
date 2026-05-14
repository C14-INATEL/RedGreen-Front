import type { CSSProperties, HTMLAttributes } from 'react';
import { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import {
  MINEFIELD_GRID_SIZE,
  type MinefieldCard,
} from './minefieldGameConfig';

type MinefieldBoardProps = Pick<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style'
> & {
  cards: MinefieldCard[];
  onCardReveal: (cardId: number) => void;
};

const BOARD_FRAME_COLOR = 0x2a1f12;
const BOARD_SURFACE_COLOR = 0x0c2615;
const CARD_BACK_COLOR = 0x123d27;
const CARD_BACK_BORDER_COLOR = 0x32724a;
const CARD_REVEALED_COLOR = 0xf1d28a;
const CARD_REVEALED_BORDER_COLOR = 0xf0c350;
const CARD_REVEALED_TEXT_COLOR = 0x2a1f12;
const CARD_BACK_TEXT_COLOR = 0xf0c350;

const destroyChildren = (container: Container) => {
  container.removeChildren().forEach((child) => {
    child.destroy({ children: true });
  });
};

const drawCardFace = (
  cardFace: Graphics,
  x: number,
  y: number,
  size: number,
  isRevealed: boolean
) => {
  const borderWidth = Math.max(2, Math.round(size * 0.055));
  const inset = Math.max(3, Math.round(size * 0.08));

  cardFace.clear();
  cardFace.lineStyle(
    borderWidth,
    isRevealed ? CARD_REVEALED_BORDER_COLOR : CARD_BACK_BORDER_COLOR,
    isRevealed ? 0.95 : 0.8
  );
  cardFace.beginFill(isRevealed ? CARD_REVEALED_COLOR : CARD_BACK_COLOR);
  cardFace.drawRect(x, y, size, size);
  cardFace.endFill();

  cardFace.lineStyle(1, 0xffffff, isRevealed ? 0.35 : 0.12);
  cardFace.moveTo(x + inset, y + inset);
  cardFace.lineTo(x + size - inset, y + inset);
  cardFace.moveTo(x + inset, y + inset);
  cardFace.lineTo(x + inset, y + size - inset);

  cardFace.lineStyle(1, 0x020617, isRevealed ? 0.32 : 0.35);
  cardFace.moveTo(x + inset, y + size - inset);
  cardFace.lineTo(x + size - inset, y + size - inset);
  cardFace.moveTo(x + size - inset, y + inset);
  cardFace.lineTo(x + size - inset, y + size - inset);
};

const createCardLabel = (
  card: MinefieldCard,
  x: number,
  y: number,
  size: number
) => {
  const label = new Text(
    card.revealed ? `+${card.points}` : 'R&G',
    new TextStyle({
      align: 'center',
      fill: card.revealed ? CARD_REVEALED_TEXT_COLOR : CARD_BACK_TEXT_COLOR,
      fontFamily: 'Press Start 2P',
      fontSize: Math.max(10, Math.floor(size * (card.revealed ? 0.2 : 0.16))),
      fontWeight: '700',
    })
  );

  label.anchor.set(0.5);
  label.position.set(Math.round(x + size / 2), Math.round(y + size / 2));
  label.resolution = 2;

  return label;
};

export const MinefieldBoard = ({
  cards,
  className,
  onCardReveal,
  style,
}: MinefieldBoardProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef(cards);
  const onCardRevealRef = useRef(onCardReveal);
  const renderBoardRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onCardRevealRef.current = onCardReveal;
  }, [onCardReveal]);

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
    let observer: ResizeObserver | null = null;
    let isDisposed = false;

    const renderBoard = () => {
      const currentRoot = root;

      if (!app || !currentRoot || isDisposed) {
        return;
      }

      const width = Math.round(host.clientWidth);
      const height = Math.round(host.clientHeight);

      if (!width || !height) {
        return;
      }

      app.renderer.resize(width, height);
      destroyChildren(currentRoot);

      const boardSize = Math.min(width, height);
      const boardX = Math.round((width - boardSize) / 2);
      const boardY = Math.round((height - boardSize) / 2);
      const outerPadding = Math.max(12, Math.round(boardSize * 0.055));
      const cellGap = Math.max(5, Math.round(boardSize * 0.018));
      const availableSize = boardSize - outerPadding * 2;
      const cellSize = Math.floor(
        (availableSize - cellGap * (MINEFIELD_GRID_SIZE - 1)) /
          MINEFIELD_GRID_SIZE
      );
      const gridSize =
        cellSize * MINEFIELD_GRID_SIZE +
        cellGap * (MINEFIELD_GRID_SIZE - 1);
      const gridX = Math.round(boardX + (boardSize - gridSize) / 2);
      const gridY = Math.round(boardY + (boardSize - gridSize) / 2);
      const framePadding = Math.max(8, Math.round(cellSize * 0.18));

      const frame = new Graphics();
      frame.beginFill(BOARD_FRAME_COLOR, 0.92);
      frame.drawRect(
        gridX - framePadding,
        gridY - framePadding,
        gridSize + framePadding * 2,
        gridSize + framePadding * 2
      );
      frame.endFill();
      frame.beginFill(BOARD_SURFACE_COLOR, 0.96);
      frame.drawRect(
        gridX - Math.round(framePadding * 0.45),
        gridY - Math.round(framePadding * 0.45),
        gridSize + Math.round(framePadding * 0.9),
        gridSize + Math.round(framePadding * 0.9)
      );
      frame.endFill();
      currentRoot.addChild(frame);

      cardsRef.current.forEach((card, cardIndex) => {
        const row = Math.floor(cardIndex / MINEFIELD_GRID_SIZE);
        const column = cardIndex % MINEFIELD_GRID_SIZE;
        const x = gridX + column * (cellSize + cellGap);
        const y = gridY + row * (cellSize + cellGap);
        const cardContainer = new Container();
        const cardFace = new Graphics();
        const cardLabel = createCardLabel(card, x, y, cellSize);

        drawCardFace(cardFace, x, y, cellSize, card.revealed);
        cardContainer.addChild(cardFace, cardLabel);
        cardContainer.eventMode = 'static';
        cardContainer.cursor = card.revealed ? 'default' : 'pointer';
        cardContainer.on('pointertap', () => {
          onCardRevealRef.current(card.id);
        });

        currentRoot.addChild(cardContainer);
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
    nextApp.stage.addChild(root);
    renderBoardRef.current = renderBoard;

    observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            renderBoard();
          });
    observer?.observe(host);

    renderBoard();

    return () => {
      isDisposed = true;
      renderBoardRef.current = null;
      observer?.disconnect();

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
