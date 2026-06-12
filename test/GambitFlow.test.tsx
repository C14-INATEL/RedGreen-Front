import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { Gambit } from '../src/presentation/games/Gambit';
import type {
  GambitResolveEffectResponse,
  GambitApiSession,
} from '../src/presentation/games/GambitGame/gambitApi';
import type { GambitVisualCard } from '../src/presentation/games/GambitGame/gambitTypes';
import type { RewardChoiceSession } from '../src/presentation/games/cardReward';
import {
  createGambitApiGrid,
  createGambitApiPendingEvent,
  createGambitApiPendingInteraction,
  createGambitApiRevealedCard,
  createGambitApiSession,
  createGambitApiUnrevealedCard,
} from './GambitTestBuilders';

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

const mockBurnActiveGambitCard = jest.fn();
const mockFetchActiveGambitSession = jest.fn();
const mockResolveActiveGambitEffect = jest.fn();
const mockResolveActiveGambitEvent = jest.fn();
const mockGambitBoard = jest.fn();

jest.mock('../src/presentation/games/GambitGame/gambitGameplayClient', () => ({
  burnActiveGambitCard: (...args: unknown[]) =>
    mockBurnActiveGambitCard(...args),
  fetchActiveGambitSession: (...args: unknown[]) =>
    mockFetchActiveGambitSession(...args),
  getGambitResolveEffectPeekResult: (response: GambitResolveEffectResponse) =>
    response.PeekResult ?? null,
  getGambitResolveEffectSession: (response: GambitResolveEffectResponse) =>
    'Session' in response ? response.Session : response,
  resolveActiveGambitEffect: (...args: unknown[]) =>
    mockResolveActiveGambitEffect(...args),
  resolveActiveGambitEvent: (...args: unknown[]) =>
    mockResolveActiveGambitEvent(...args),
}));

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
            card.title
          )
        )
      );
    },
  };
});

const createSessionAfterBurn = (
  position: number,
  overrides: Partial<GambitApiSession> = {}
) =>
  createGambitApiSession({
    AccumulatedPoints: 15,
    BurnsRemaining: 24,
    ManualFlipsCount: 1,
    Grid: createGambitApiGrid({
      Revealed: [
        createGambitApiRevealedCard({
          Points: 15,
          Position: position,
        }),
      ],
      Unrevealed: Array.from({ length: 25 }, (_, index) =>
        createGambitApiUnrevealedCard({ Position: index })
      ).filter((card) => card.Position !== position),
    }),
    ...overrides,
  });

describe('Gambit backend gameplay flow', () => {
  beforeEach(() => {
    mockBurnActiveGambitCard.mockReset();
    mockFetchActiveGambitSession.mockReset();
    mockGambitBoard.mockClear();
    mockResolveActiveGambitEffect.mockReset();
    mockResolveActiveGambitEvent.mockReset();
  });

  it('shows an empty active-session message when no session is provided', async () => {
    render(createElement(Gambit));

    expect(
      await screen.findByText('Nenhuma sessão ativa do Gambit encontrada.')
    ).toBeInTheDocument();
    expect(mockGambitBoard).not.toHaveBeenCalled();
    expect(mockBurnActiveGambitCard).not.toHaveBeenCalled();
  });

  it('shows the explicit visual mock banner only when mock gameplay is selected', async () => {
    render(
      createElement(Gambit, {
        gameplaySource: 'mock',
        initialSession: createGambitApiSession(),
      })
    );

    expect(
      await screen.findByText('Modo mock visual do Gambit ativo')
    ).toBeInTheDocument();
    expect(mockGambitBoard).toHaveBeenCalled();
  });

  it('burns a closed card through the active gameplay endpoint', async () => {
    mockBurnActiveGambitCard.mockResolvedValueOnce(createSessionAfterBurn(7));

    render(
      createElement(Gambit, {
        initialSession: createGambitApiSession(),
      })
    );

    fireEvent.click(screen.getByText('reveal-7'));

    await waitFor(() => {
      expect(mockBurnActiveGambitCard).toHaveBeenCalledWith(7);
    });
    expect(await screen.findByText('15')).toBeInTheDocument();
    expect(mockGambitBoard).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cards: expect.arrayContaining([
          expect.objectContaining({
            id: 7,
            points: 15,
            revealed: true,
          }),
        ]),
      })
    );
  });

  it('resolves PendingEvent with GoodIndex and BadIndex from the reward modal', async () => {
    mockResolveActiveGambitEvent.mockResolvedValueOnce(
      createGambitApiSession()
    );

    render(
      createElement(Gambit, {
        initialSession: createGambitApiSession({
          Grid: createGambitApiGrid({
            PendingEvent: createGambitApiPendingEvent(),
          }),
          ManualFlipsCount: 5,
        }),
      })
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Escolher Dobro de Potassio' })
    );

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Escolher Coringa do Inatel',
      })
    );

    await waitFor(() => {
      expect(mockResolveActiveGambitEvent).toHaveBeenCalledWith({
        BadIndex: 2,
        GoodIndex: 0,
      });
    });
  });

  it('accumulates PendingInteraction selections before resolving the effect', async () => {
    mockResolveActiveGambitEffect.mockResolvedValueOnce({
      PeekResult: {
        AtLeastOneBad: true,
      },
      Session: createGambitApiSession(),
    });

    render(
      createElement(Gambit, {
        initialSession: createGambitApiSession({
          Grid: createGambitApiGrid({
            PendingInteraction: createGambitApiPendingInteraction({
              Action: 'SELECT_MULTIPLE_CARDS',
              Effect: 'CABECINHA',
              RequiredSelections: 3,
            }),
          }),
        }),
      })
    );

    fireEvent.click(screen.getByText('reveal-0'));
    expect(screen.getByText('1/3')).toBeInTheDocument();

    fireEvent.click(screen.getByText('reveal-1'));
    expect(screen.getByText('2/3')).toBeInTheDocument();
    expect(mockResolveActiveGambitEffect).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('reveal-2'));

    await waitFor(() => {
      expect(mockResolveActiveGambitEffect).toHaveBeenCalledWith([0, 1, 2]);
    });
    expect(await screen.findByText('Ha carta ruim')).toBeInTheDocument();
  });

  it('shows Clarividencia PeekResult without revealing the card locally', async () => {
    mockResolveActiveGambitEffect.mockResolvedValueOnce({
      PeekResult: {
        Effect: null,
        Points: 40,
        Position: 4,
      },
      Session: createGambitApiSession(),
    });

    render(
      createElement(Gambit, {
        initialSession: createGambitApiSession({
          Grid: createGambitApiGrid({
            PendingInteraction: createGambitApiPendingInteraction(),
          }),
        }),
      })
    );

    fireEvent.click(screen.getByText('reveal-4'));

    await waitFor(() => {
      expect(mockResolveActiveGambitEffect).toHaveBeenCalledWith([4]);
    });
    expect(await screen.findByText('Carta 4: +40')).toBeInTheDocument();
    expect(mockGambitBoard).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cards: expect.arrayContaining([
          expect.objectContaining({
            id: 4,
            points: 40,
            previewed: true,
            revealed: false,
          }),
        ]),
      })
    );
  });
});
