import {
  describe,
  expect,
  it,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useCardRewardController } from '../src/presentation/games/cardReward/systems/cardReward/useCardRewardController';
import type {
  RewardCardDefinition,
  RewardCardOption,
  RewardSelectionResult,
  RewardTimingsConfig,
  RewardTriggerConfig,
} from '../src/presentation/games/cardReward/types/cardReward';

const rewardPool: RewardCardDefinition[] = [
  {
    description: 'Revela uma pista da mesa.',
    id: 'clarividencia',
    spritePath: '/Gambit/SpriteCards1.png',
    subtitle: 'Visao',
    title: 'Clarividencia',
  },
  {
    description: 'Anula o efeito atual.',
    id: 'anulacao-total',
    spritePath: '/Gambit/SpriteCards2.png',
    subtitle: 'Controle',
    title: 'Anulacao Total',
  },
  {
    description: 'Inverte a mesa.',
    id: 'inversao-gravitacional',
    spritePath: '/Gambit/SpriteCards3.png',
    subtitle: 'Campo',
    title: 'Inversao Gravitacional',
  },
];

const triggerConfig: RewardTriggerConfig = {
  carryOverRevealProgress: false,
  optionsPerChoice: 3,
  revealInterval: 1,
  selectionLimit: 2,
};

const timings: RewardTimingsConfig = {
  bannerEntranceDuration: 0,
  cardEntranceDuration: 0,
  cardEntranceStagger: 0,
  modalFadeDuration: 0,
  revealCompletionDelay: 0,
  revealObservationDelay: 0,
  selectedCardCenteringDurationMs: 0,
  selectedCardFlyAwayDurationMs: 0,
  selectionResolveDelayMs: 0,
  tablePostTransitionHoldMs: 0,
  tableTransitionBreathingDelayMs: 0,
  tableTransitionDramaticPauseMs: 0,
  tableTransitionDurationMs: 0,
  transitionPreparationDelay: 0,
};

const resolveOptions = (
  pool: RewardCardDefinition[],
  amount: number,
  sessionId: string
): RewardCardOption[] =>
  pool.slice(0, amount).map((card, optionIndex) => ({
    ...card,
    optionId: `${sessionId}-${card.id}`,
    optionIndex,
    sessionId,
  }));

type RewardControllerHarnessProps = {
  acceptedSelections: boolean[];
  onRewardSelected?: (result: RewardSelectionResult) => Promise<void> | void;
};

const RewardControllerHarness = ({
  acceptedSelections,
  onRewardSelected,
}: RewardControllerHarnessProps) => {
  const rewardController = useCardRewardController({
    onRewardSelected,
    optionsResolver: resolveOptions,
    revealedCardCount: 0,
    rewardPool,
    timings,
    triggerConfig,
  });
  const activeSession = rewardController.activeSession;

  return (
    <div>
      <p>session:{activeSession ? activeSession.status : 'closed'}</p>
      <p>locked:{String(rewardController.isRewardSelectionLocked)}</p>
      <p>
        history:
        {activeSession
          ? activeSession.selectionHistory
              .map((selection) => selection.optionId)
              .join('|')
          : 'none'}
      </p>
      <p>selection-count:{activeSession?.selectionHistory.length ?? 0}</p>

      <button
        onClick={() => rewardController.registerCardReveal(0)}
        type="button"
      >
        reveal
      </button>
      <button
        onClick={() => rewardController.handleRevealAnimationComplete(0)}
        type="button"
      >
        complete-reveal
      </button>

      {activeSession?.normalTableCards.map((card, index) => (
        <button
          key={card.optionId}
          onClick={() => {
            acceptedSelections.push(
              rewardController.handleRewardCardSelect(card.optionId)
            );
          }}
          type="button"
        >
          normal-{index}
        </button>
      ))}

      {activeSession?.badTableCards.map((card, index) => (
        <button
          key={card.optionId}
          onClick={() => {
            acceptedSelections.push(
              rewardController.handleRewardCardSelect(card.optionId)
            );
          }}
          type="button"
        >
          bad-{index}
        </button>
      ))}

      <button
        onClick={() => {
          if (activeSession) {
            rewardController.handleTableTransitionComplete(activeSession.id);
          }
        }}
        type="button"
      >
        complete-transition
      </button>
      <button
        onClick={() => {
          if (activeSession) {
            rewardController.handleSelectedCardCinematicComplete(
              activeSession.id
            );
          }
        }}
        type="button"
      >
        complete-cinematic
      </button>
    </div>
  );
};

const openRewardChoice = () => {
  fireEvent.click(screen.getByText('reveal'));
  fireEvent.click(screen.getByText('complete-reveal'));

  act(() => {
    jest.runOnlyPendingTimers();
  });
};

describe('useCardRewardController reward selection lock', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('accepts only the first special card click before the transition settles', () => {
    const acceptedSelections: boolean[] = [];

    render(<RewardControllerHarness acceptedSelections={acceptedSelections} />);

    openRewardChoice();

    fireEvent.click(screen.getByText('normal-0'));
    fireEvent.click(screen.getByText('normal-1'));

    expect(acceptedSelections).toEqual([true, false]);
    expect(screen.getByText('locked:true')).toBeInTheDocument();
    expect(screen.getByText('selection-count:1')).toBeInTheDocument();
  });

  it('keeps choices locked until the table transition completes, then accepts the next table choice', () => {
    const acceptedSelections: boolean[] = [];

    render(<RewardControllerHarness acceptedSelections={acceptedSelections} />);

    openRewardChoice();

    fireEvent.click(screen.getByText('normal-0'));
    fireEvent.click(screen.getByText('normal-1'));
    fireEvent.click(screen.getByText('complete-transition'));
    fireEvent.click(screen.getByText('bad-0'));

    expect(acceptedSelections).toEqual([true, false, true]);
    expect(screen.getByText('session:resolving')).toBeInTheDocument();
    expect(screen.getByText('locked:true')).toBeInTheDocument();
    expect(screen.getByText('selection-count:2')).toBeInTheDocument();
  });

  it('clears the reward selection lock when the selected-card cinematic finishes', async () => {
    const acceptedSelections: boolean[] = [];
    const onRewardSelected = jest.fn();

    render(
      <RewardControllerHarness
        acceptedSelections={acceptedSelections}
        onRewardSelected={onRewardSelected}
      />
    );

    openRewardChoice();

    fireEvent.click(screen.getByText('normal-0'));
    fireEvent.click(screen.getByText('complete-transition'));
    fireEvent.click(screen.getByText('bad-0'));
    fireEvent.click(screen.getByText('complete-cinematic'));

    await waitFor(() =>
      expect(screen.getByText('session:closed')).toBeInTheDocument()
    );

    expect(onRewardSelected).toHaveBeenCalledTimes(1);
    expect(screen.getByText('locked:false')).toBeInTheDocument();
  });
});
