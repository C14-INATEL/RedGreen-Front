import type { CSSProperties, HTMLAttributes } from 'react';
import { useEffect, useRef } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import {
  MINEFIELD_CELL_COUNT,
  MINEFIELD_GRID_SIZE,
} from './minefieldGameConfig';

type MinefieldBoardProps = Pick<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style'
> & {
  onCellSelect: (cellIndex: number) => void;
  selectedCells: ReadonlySet<number>;
};

const BOARD_FRAME_COLOR = 0x2a1f12;
const BOARD_SURFACE_COLOR = 0x0c2615;
const CELL_DEFAULT_COLOR = 0x16482c;
const CELL_DEFAULT_BORDER_COLOR = 0x32724a;
const CELL_SELECTED_COLOR = 0xb52025;
const CELL_SELECTED_BORDER_COLOR = 0xf0c350;

const destroyChildren = (container: Container) => {
  container.removeChildren().forEach((child) => {
    child.destroy({ children: true });
  });
};

const drawCell = (
  cell: Graphics,
  x: number,
  y: number,
  size: number,
  isSelected: boolean
) => {
  const borderWidth = Math.max(2, Math.round(size * 0.055));
  const inset = Math.max(3, Math.round(size * 0.08));

  cell.clear();
  cell.lineStyle(
    borderWidth,
    isSelected ? CELL_SELECTED_BORDER_COLOR : CELL_DEFAULT_BORDER_COLOR,
    isSelected ? 0.95 : 0.8
  );
  cell.beginFill(isSelected ? CELL_SELECTED_COLOR : CELL_DEFAULT_COLOR);
  cell.drawRect(x, y, size, size);
  cell.endFill();

  cell.lineStyle(1, 0xffffff, isSelected ? 0.22 : 0.12);
  cell.moveTo(x + inset, y + inset);
  cell.lineTo(x + size - inset, y + inset);
  cell.moveTo(x + inset, y + inset);
  cell.lineTo(x + inset, y + size - inset);

  cell.lineStyle(1, 0x020617, isSelected ? 0.42 : 0.35);
  cell.moveTo(x + inset, y + size - inset);
  cell.lineTo(x + size - inset, y + size - inset);
  cell.moveTo(x + size - inset, y + inset);
  cell.lineTo(x + size - inset, y + size - inset);
};

export const MinefieldBoard = ({
  className,
  onCellSelect,
  selectedCells,
  style,
}: MinefieldBoardProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const onCellSelectRef = useRef(onCellSelect);
  const renderBoardRef = useRef<(() => void) | null>(null);
  const selectedCellsRef = useRef(selectedCells);

  useEffect(() => {
    onCellSelectRef.current = onCellSelect;
  }, [onCellSelect]);

  useEffect(() => {
    selectedCellsRef.current = selectedCells;
    renderBoardRef.current?.();
  }, [selectedCells]);

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
      if (!app || !root || isDisposed) {
        return;
      }

      const width = Math.round(host.clientWidth);
      const height = Math.round(host.clientHeight);

      if (!width || !height) {
        return;
      }

      app.renderer.resize(width, height);
      destroyChildren(root);

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
      root.addChild(frame);

      for (let cellIndex = 0; cellIndex < MINEFIELD_CELL_COUNT; cellIndex += 1) {
        const row = Math.floor(cellIndex / MINEFIELD_GRID_SIZE);
        const column = cellIndex % MINEFIELD_GRID_SIZE;
        const x = gridX + column * (cellSize + cellGap);
        const y = gridY + row * (cellSize + cellGap);
        const cell = new Graphics();

        drawCell(cell, x, y, cellSize, selectedCellsRef.current.has(cellIndex));
        cell.eventMode = 'static';
        cell.cursor = 'pointer';
        cell.on('pointertap', () => {
          onCellSelectRef.current(cellIndex);
        });

        root.addChild(cell);
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
