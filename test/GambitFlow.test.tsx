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
          }:locked:${String(props.interactionLocked)}`
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
            onClick: () => props.onCardRevealAnimationComplete?.(0),
            type: 'button',
          },
          'complete-0'
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

  it('passes a stable 5x5 ViewModel grid into the visual board', () => {
    render(createElement(Gambit));

    expect(
      screen.getByText('cards:25:revealed:0:locked:false')
    ).toBeInTheDocument();
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

    fireEvent.click(screen.getByText('reveal-0'));

    expect(
      screen.getByText('cards:25:revealed:1:locked:true')
    ).toBeInTheDocument();
    expect(mockRegisterCardReveal).toHaveBeenCalledWith(0);
  });

  it('ignores a second fast reveal until the current card animation completes', () => {
    render(createElement(Gambit));

    fireEvent.click(screen.getByText('reveal-0'));
    fireEvent.click(screen.getByText('reveal-1'));

    expect(mockRegisterCardReveal).toHaveBeenCalledTimes(1);
    expect(mockRegisterCardReveal).toHaveBeenLastCalledWith(0);
    expect(
      screen.getByText('cards:25:revealed:1:locked:true')
    ).toBeInTheDocument();
    expect(mockGambitBoard).toHaveBeenLastCalledWith(
      expect.objectContaining({
        interactionLocked: true,
      })
    );

    fireEvent.click(screen.getByText('complete-0'));

    expect(mockHandleRevealAnimationComplete).toHaveBeenCalledWith(0);
    expect(
      screen.getByText('cards:25:revealed:1:locked:false')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('reveal-1'));

    expect(mockRegisterCardReveal).toHaveBeenCalledTimes(2);
    expect(mockRegisterCardReveal).toHaveBeenLastCalledWith(1);
    expect(
      screen.getByText('cards:25:revealed:2:locked:true')
    ).toBeInTheDocument();
  });
});
