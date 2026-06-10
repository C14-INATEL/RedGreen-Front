import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { Gambit } from '../src/presentation/games/Gambit';
import { makeMockGambitSession } from '../src/presentation/games/GambitGame/gambitGameMock';
import type { GambitVisualCard } from '../src/presentation/games/GambitGame/gambitTypes';

type MotionDivProps = {
  children?: ReactNode;
};

type MockGambitBoardProps = {
  cards: GambitVisualCard[];
  clarividenciaPreviewMode?: boolean;
  interactionLocked?: boolean;
  onCardReveal: (cardId: number) => void;
  onCardRevealAnimationComplete?: (cardId: number) => void;
};

const mockGambitBoard = jest.fn();

jest.mock('framer-motion', () => {
  const React = jest.requireActual('react') as typeof import('react');

  return {
    motion: {
      div: ({ children }: MotionDivProps) =>
        React.createElement('div', null, children),
    },
  };
});

jest.mock('../src/presentation/games/GambitGame/GambitBoard', () => {
  const React = jest.requireActual('react') as typeof import('react');

  return {
    GambitBoard: (props: MockGambitBoardProps) => {
      mockGambitBoard(props);

      return React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          null,
          `cards:${props.cards.length}:revealed:${
            props.cards.filter((card) => card.revealed).length
          }:previewed:${
            props.cards.filter((card) => card.previewed).length
          }:locked:${String(props.interactionLocked)}:preview-mode:${String(
            props.clarividenciaPreviewMode
          )}`
        ),
        ...props.cards.map((card) =>
          React.createElement(
            'button',
            {
              key: `reveal-${card.id}`,
              onClick: () => props.onCardReveal(card.id),
              type: 'button',
            },
            `reveal-${card.id}`
          )
        ),
        React.createElement(
          'button',
          {
            onClick: () => props.onCardRevealAnimationComplete?.(-1),
            type: 'button',
          },
          'complete'
        )
      );
    },
  };
});

const revealAndComplete = (position: number) => {
  fireEvent.click(screen.getByText(`reveal-${position}`));
  fireEvent.click(screen.getByText('complete'));
};

describe('Gambit visual flow', () => {
  beforeEach(() => {
    mockGambitBoard.mockClear();
  });

  it('opens Clarividencia interaction and peeks without revealing the target card', () => {
    render(
      createElement(Gambit, {
        initialSession: makeMockGambitSession('clarividenciaFlow'),
      })
    );

    revealAndComplete(10);

    expect(screen.getByText('CLARIVIDENCIA')).toBeInTheDocument();
    expect(screen.getByText('0/1')).toBeInTheDocument();
    expect(
      screen.getByText(
        'cards:25:revealed:1:previewed:0:locked:false:preview-mode:true'
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('reveal-0'));

    expect(screen.getByText('Carta 0: +10')).toBeInTheDocument();
    expect(
      screen.getByText(
        'cards:25:revealed:1:previewed:1:locked:true:preview-mode:true'
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Fechar espiada'));

    expect(
      screen.getByText(
        'cards:25:revealed:1:previewed:0:locked:false:preview-mode:false'
      )
    ).toBeInTheDocument();
  });

  it('blocks the board while PendingEvent is open and resolves it with good and bad choices', () => {
    render(
      createElement(Gambit, {
        initialSession: makeMockGambitSession('effectsOnBoard'),
      })
    );

    [0, 1, 2, 3, 4].forEach(revealAndComplete);

    expect(screen.getByText('Evento pendente')).toBeInTheDocument();
    expect(screen.getByText('5/25')).toBeInTheDocument();
    expect(
      screen.getByText(
        'cards:25:revealed:5:previewed:0:locked:true:preview-mode:false'
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Boa 1'));
    fireEvent.click(screen.getByText('Ruim 3'));

    expect(screen.queryByText('Evento pendente')).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'cards:25:revealed:5:previewed:0:locked:false:preview-mode:false'
      )
    ).toBeInTheDocument();
  });

  it('applies Inversao Gravitacional to the next point card in the visual flow', () => {
    render(
      createElement(Gambit, {
        initialSession: makeMockGambitSession('effectsOnBoard'),
      })
    );

    revealAndComplete(6);

    expect(screen.getByText('INVERSAO GRAVITACIONAL')).toBeInTheDocument();
    expect(mockGambitBoard).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cards: expect.arrayContaining([
          expect.objectContaining({
            effect: 'inversao-gravitacional',
            id: 6,
            points: null,
            revealed: true,
          }),
        ]),
      })
    );

    revealAndComplete(0);

    expect(screen.getByText('-10')).toBeInTheDocument();
    expect(screen.getByText('Nenhum')).toBeInTheDocument();
    expect(mockGambitBoard).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cards: expect.arrayContaining([
          expect.objectContaining({
            id: 0,
            points: 10,
            revealed: true,
          }),
        ]),
      })
    );
  });
});
