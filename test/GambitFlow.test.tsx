import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { Gambit } from '../src/presentation/games/Gambit';
import type { GambitCard } from '../src/presentation/games/GambitGame/gambitGameConfig';

type MotionDivProps = {
  children?: ReactNode;
};

type MockGambitBoardProps = {
  cards: GambitCard[];
  onCardReveal: (cardId: number) => void;
};

const mockGambitBoard = jest.fn();
const mockRegisterCardReveal = jest.fn();

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
    handleRevealAnimationComplete: jest.fn(),
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
        'button',
        {
          onClick: () => props.onCardReveal(0),
          type: 'button',
        },
        `cards:${props.cards.length}:revealed:${
          props.cards.filter((card) => card.revealed).length
        }`
      );
    },
  };
});

describe('Gambit visual flow', () => {
  beforeEach(() => {
    mockGambitBoard.mockClear();
    mockRegisterCardReveal.mockClear();
  });

  it('passes a stable 5x5 ViewModel grid into the visual board', () => {
    render(createElement(Gambit));

    expect(screen.getByText('cards:25:revealed:0')).toBeInTheDocument();
    expect(mockGambitBoard).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cards: expect.arrayContaining([
          expect.objectContaining({
            id: 0,
            points: 0,
            position: 0,
            revealed: false,
          }),
        ]),
      })
    );
  });

  it('reveals a card through the existing visual interaction contract', () => {
    render(createElement(Gambit));

    fireEvent.click(screen.getByText('cards:25:revealed:0'));

    expect(screen.getByText('cards:25:revealed:1')).toBeInTheDocument();
    expect(mockRegisterCardReveal).toHaveBeenCalledWith(0);
  });
});
