import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { Gambit } from '../src/presentation/games/Gambit';
import { makeMockGambitSession } from '../src/presentation/games/GambitGame/gambitGameMock';
import type { GambitVisualCard } from '../src/presentation/games/GambitGame/gambitTypes';
import type { RewardChoiceSession } from '../src/presentation/games/cardReward';

type MotionElementProps = {
  children?: ReactNode;
  [key: string]: unknown;
};

type MockGambitBoardProps = {
  cards: GambitVisualCard[];
  clarividenciaPreviewMode?: boolean;
  interactionLocked?: boolean;
  onCardReveal: (cardId: number) => void;
  onCardRevealAnimationComplete?: (cardId: number) => void;
};

type MockRewardChoiceModalProps = {
  isSelectionLocked?: boolean;
  onCardHover: (card: RewardChoiceSession['normalTableCards'][number]) => void;
  onCardSelect: (optionId: string) => boolean;
  onSelectedCardCinematicComplete: (sessionId: string) => void;
  onTableTransitionComplete: (sessionId: string) => void;
  session: RewardChoiceSession | null;
};

const mockGambitBoard = jest.fn();

jest.mock('framer-motion', () => {
  const React = jest.requireActual('react') as typeof import('react');
  const motionComponent =
    (tagName: keyof HTMLElementTagNameMap) =>
    ({ children, ...props }: MotionElementProps) => {
      const {
        animate,
        custom,
        exit,
        initial,
        onHoverEnd,
        onHoverStart,
        transition,
        variants,
        whileHover,
        whileTap,
        ...domProps
      } = props;

      void animate;
      void custom;
      void exit;
      void initial;
      void onHoverEnd;
      void onHoverStart;
      void transition;
      void variants;
      void whileHover;
      void whileTap;

      return React.createElement(tagName, domProps, children);
    };

  return {
    AnimatePresence: ({ children }: { children?: ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    motion: {
      div: motionComponent('div'),
      img: motionComponent('img'),
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

jest.mock('../src/presentation/games/cardReward', () => {
  const React = jest.requireActual('react') as typeof import('react');

  return {
    __esModule: true,
    RewardChoiceModal: ({
      isSelectionLocked = false,
      onCardHover,
      onCardSelect,
      onSelectedCardCinematicComplete,
      onTableTransitionComplete,
      session,
    }: MockRewardChoiceModalProps) => {
      if (!session) {
        return null;
      }

      const displayedCards =
        session.tableState.currentTable === 'bad'
          ? session.badTableCards
          : session.normalTableCards;

      return React.createElement(
        'div',
        {
          'aria-label': 'Evento Especial',
          role: 'dialog',
        },
        React.createElement('p', null, 'Evento Especial'),
        ...displayedCards.map((card) =>
          React.createElement(
            'button',
            {
              'aria-label': `Escolher ${card.title}`,
              disabled: isSelectionLocked,
              key: card.optionId,
              onClick: () => {
                onCardHover(card);

                if (!onCardSelect(card.optionId)) {
                  return;
                }

                if (session.tableState.currentTable === 'normal') {
                  onTableTransitionComplete(session.id);
                  return;
                }

                onSelectedCardCinematicComplete(session.id);
              },
              type: 'button',
            },
            React.createElement('img', {
              alt: card.title,
              src: card.spritePath,
            }),
            React.createElement('span', null, card.title),
            React.createElement('span', null, card.subtitle),
            React.createElement('span', null, card.description)
          )
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
    jest.useFakeTimers();

    try {
      render(
        createElement(Gambit, {
          initialSession: makeMockGambitSession('clarividenciaFlow'),
        })
      );

      revealAndComplete(8);

      expect(screen.getByText('CLARIVIDENCIA')).toBeInTheDocument();
      expect(screen.getByText('0/1')).toBeInTheDocument();
      expect(
        screen.getByText(
          'cards:25:revealed:1:previewed:0:locked:true:preview-mode:true'
        )
      ).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1450);
      });

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
    } finally {
      jest.useRealTimers();
    }
  });

  it('shows visual PendingEvent cards and resolves it with good and bad choices', () => {
    render(
      createElement(Gambit, {
        initialSession: makeMockGambitSession('effectsOnBoard'),
      })
    );

    [0, 1, 2, 3, 16].forEach(revealAndComplete);

    const eventDialog = screen.getByRole('dialog', {
      name: 'Evento Especial',
    });

    expect(eventDialog).toBeInTheDocument();
    expect(screen.queryByText('Boa 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Ruim 1')).not.toBeInTheDocument();
    expect(
      within(eventDialog).getByAltText('Dobro de Potassio')
    ).toBeInTheDocument();
    expect(
      within(eventDialog).getByText(
        'Dobra os pontos da proxima carta revelada.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('5/25')).toBeInTheDocument();
    expect(
      screen.getByText(
        'cards:25:revealed:5:previewed:0:locked:true:preview-mode:false'
      )
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Escolher Dobro de Potassio' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Escolher Coringa do Inatel' })
    );

    expect(
      screen.queryByRole('dialog', { name: 'Evento Especial' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'cards:25:revealed:5:previewed:0:locked:false:preview-mode:false'
      )
    ).toBeInTheDocument();
  });

  it('shows prepared effect sprite and clears the slot after the next point uses it', () => {
    jest.useFakeTimers();

    try {
      render(
        createElement(Gambit, {
          initialSession: makeMockGambitSession('effectsOnBoard'),
        })
      );

      expect(screen.getByText('NENHUM')).toBeInTheDocument();

      revealAndComplete(4);

      const cinematic = screen.getByTestId('gambit-reveal-cinematic');

      expect(cinematic).toHaveAttribute('data-nature', 'good');
      expect(
        within(cinematic).getByAltText('Dobro de Potassio')
      ).toBeInTheDocument();
      expect(
        within(cinematic).getByText('Dobro de Potassio')
      ).toBeInTheDocument();
      expect(
        within(cinematic).getByText(
          'Dobra os pontos da proxima carta revelada.'
        )
      ).toBeInTheDocument();
      expect(
        within(cinematic).getByTestId('gambit-reveal-points')
      ).toHaveTextContent('+20');
      expect(screen.queryByText('Carta Boa')).not.toBeInTheDocument();
      expect(screen.queryByText('Carta Ruim')).not.toBeInTheDocument();
      expect(screen.queryByText('Carta Neutra')).not.toBeInTheDocument();
      expect(screen.getAllByText('Dobro de Potassio').length).toBeGreaterThan(
        1
      );
      expect(mockGambitBoard).toHaveBeenLastCalledWith(
        expect.objectContaining({
          cards: expect.arrayContaining([
            expect.objectContaining({
              effect: 'dobro-de-potassio',
              id: 4,
              points: 20,
              revealed: true,
            }),
          ]),
          interactionLocked: true,
        })
      );

      act(() => {
        jest.advanceTimersByTime(1450);
      });

      expect(
        screen.queryByTestId('gambit-reveal-cinematic')
      ).not.toBeInTheDocument();

      revealAndComplete(0);

      expect(screen.getByText('40')).toBeInTheDocument();
      expect(screen.getByText('NENHUM')).toBeInTheDocument();
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
    } finally {
      jest.useRealTimers();
    }
  });

  it('reveals points-only cards without a screen message', () => {
    render(
      createElement(Gambit, {
        initialSession: makeMockGambitSession('effectsOnBoard'),
      })
    );

    fireEvent.click(screen.getByText('reveal-0'));

    expect(
      screen.queryByTestId('gambit-reveal-cinematic')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Carta Boa')).not.toBeInTheDocument();
    expect(screen.queryByText('Carta Ruim')).not.toBeInTheDocument();
    expect(screen.queryByText('Carta Neutra')).not.toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(
      screen.getByText(
        'cards:25:revealed:1:previewed:0:locked:true:preview-mode:false'
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('complete'));

    expect(
      screen.getByText(
        'cards:25:revealed:1:previewed:0:locked:false:preview-mode:false'
      )
    ).toBeInTheDocument();
  });

  it('shows immediate coringas in the screen message without preparing the panel', () => {
    render(
      createElement(Gambit, {
        initialSession: makeMockGambitSession('effectsOnBoard'),
      })
    );

    revealAndComplete(8);

    const cinematic = screen.getByTestId('gambit-reveal-cinematic');

    expect(cinematic).toHaveAttribute('data-nature', 'good');
    expect(within(cinematic).getByAltText('Clarividencia')).toBeInTheDocument();
    expect(within(cinematic).getByText('Clarividencia')).toBeInTheDocument();
    expect(
      within(cinematic).getByText('Revela uma pista sobre uma carta fechada.')
    ).toBeInTheDocument();
    expect(screen.getByText('NENHUM')).toBeInTheDocument();
    expect(screen.getByText('0/1')).toBeInTheDocument();
    expect(screen.queryByText('Carta Boa')).not.toBeInTheDocument();
  });

  it('uses red styling for bad coringa messages', () => {
    render(
      createElement(Gambit, {
        initialSession: makeMockGambitSession('effectsOnBoard'),
      })
    );

    revealAndComplete(5);

    const cinematic = screen.getByTestId('gambit-reveal-cinematic');

    expect(cinematic).toHaveAttribute('data-nature', 'bad');
    expect(within(cinematic).getByText('Melancidio')).toBeInTheDocument();
    expect(
      within(cinematic).getByTestId('gambit-reveal-points')
    ).toHaveTextContent('-20');
    expect(screen.queryByText('Carta Ruim')).not.toBeInTheDocument();
  });

  it('waits for the coringa message before opening the pending event', () => {
    jest.useFakeTimers();

    try {
      render(
        createElement(Gambit, {
          initialSession: makeMockGambitSession('effectsOnBoard'),
        })
      );

      [0, 1, 2, 3].forEach(revealAndComplete);
      revealAndComplete(4);

      expect(screen.getByTestId('gambit-reveal-cinematic')).toBeInTheDocument();
      expect(
        screen.queryByRole('dialog', { name: 'Evento Especial' })
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(
          'cards:25:revealed:5:previewed:0:locked:true:preview-mode:false'
        )
      ).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1100);
      });

      expect(
        screen.queryByTestId('gambit-reveal-cinematic')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('dialog', { name: 'Evento Especial' })
      ).not.toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(350);
      });

      expect(
        screen.getByRole('dialog', { name: 'Evento Especial' })
      ).toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });
});
