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
const mockRegisterCardReveal = jest.fn();
const mockHandleRevealAnimationComplete = jest.fn();

jest.mock('framer-motion', () => {
  const React = jest.requireActual('react') as typeof import('react');

  return {
    motion: {
      div: ({ children }: MotionDivProps) =>
        React.createElement('div', null, children),
    },
  };
});

jest.mock('../src/presentation/games/cardReward', () => ({
  RewardChoiceModal: () => null,
  rewardTriggerConfig: {
    revealInterval: 3,
  },
  useCardRewardController: ({
    revealedCardCount,
  }: {
    revealedCardCount: number;
  }) => ({
    activeSession: null,
    handleRevealAnimationComplete: (...args: unknown[]) =>
      mockHandleRevealAnimationComplete(...args),
    handleRewardCardHover: jest.fn(),
    handleRewardCardSelect: jest.fn(),
    handleSelectedCardCinematicComplete: jest.fn(),
    handleTableTransitionComplete: jest.fn(),
    isInteractionLocked: false,
    registerCardReveal: (...args: unknown[]) => mockRegisterCardReveal(...args),
    revealProgress: revealedCardCount,
  }),
}));

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
        React.createElement(
          'button',
          {
            onClick: () => props.onCardReveal(0),
            type: 'button',
          },
          'reveal-0'
        ),
        React.createElement(
          'button',
          {
            onClick: () => props.onCardReveal(1),
            type: 'button',
          },
          'reveal-1'
        ),
        React.createElement(
          'button',
          {
            onClick: () => props.onCardReveal(2),
            type: 'button',
          },
          'reveal-2'
        ),
        React.createElement(
          'button',
          {
            onClick: () => props.onCardReveal(13),
            type: 'button',
          },
          'reveal-13'
        ),
        React.createElement(
          'button',
          {
            onClick: () => props.onCardReveal(18),
            type: 'button',
          },
          'reveal-18'
        ),
        React.createElement(
          'button',
          {
            onClick: () => props.onCardRevealAnimationComplete?.(0),
            type: 'button',
          },
          'complete-0'
        ),
        React.createElement(
          'button',
          {
            onClick: () => props.onCardRevealAnimationComplete?.(13),
            type: 'button',
          },
          'complete-13'
        ),
        React.createElement(
          'button',
          {
            onClick: () => props.onCardRevealAnimationComplete?.(18),
            type: 'button',
          },
          'complete-18'
        )
      );
    },
  };
});

describe('Gambit visual flow', () => {
  beforeEach(() => {
    mockGambitBoard.mockClear();
    mockHandleRevealAnimationComplete.mockClear();
    mockRegisterCardReveal.mockClear();
  });

  it('previews the next closed card when Clarividencia is prepared', () => {
    render(
      createElement(Gambit, {
        initialSession: makeMockGambitSession('clarividenciaFlow'),
      })
    );

    fireEvent.click(screen.getByText('reveal-1'));

    expect(mockRegisterCardReveal).not.toHaveBeenCalled();
    expect(mockGambitBoard).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cards: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            points: -15,
            previewed: true,
            revealed: false,
          }),
        ]),
      })
    );
    expect(
      screen.getByText(
        'cards:25:revealed:0:previewed:1:locked:true:preview-mode:false'
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancelar'));

    expect(
      screen.getByText(
        'cards:25:revealed:0:previewed:0:locked:false:preview-mode:false'
      )
    ).toBeInTheDocument();
  });

  it('applies Inversao Gravitacional to the next point card in the visual flow', () => {
    render(
      createElement(Gambit, {
        initialSession: makeMockGambitSession('effectsOnBoard'),
      })
    );

    fireEvent.click(screen.getByText('reveal-18'));

    expect(screen.getByText('Efeito preparado')).toBeInTheDocument();
    expect(mockGambitBoard).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cards: expect.arrayContaining([
          expect.objectContaining({
            effect: 'inversao-gravitacional',
            id: 18,
            points: null,
            revealed: true,
          }),
        ]),
      })
    );

    fireEvent.click(screen.getByText('complete-18'));
    fireEvent.click(screen.getByText('reveal-13'));

    expect(screen.getByText('-30')).toBeInTheDocument();
    expect(screen.getByText('Evento configuravel')).toBeInTheDocument();
    expect(mockGambitBoard).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cards: expect.arrayContaining([
          expect.objectContaining({
            id: 13,
            points: 30,
            revealed: true,
          }),
        ]),
      })
    );
  });
});
