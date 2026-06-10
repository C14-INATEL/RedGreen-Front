import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { GambitTableCard } from '../src/presentation/ui/Gambit/GambitTableCard';

const DefaultProps = {
  GambitTableId: 1,
  Name: 'Mesa Ouro',
  MinimumChipsRequired: 500,
  CardPrice: 100,
  TableMultiplier: 2,
  MinimumCardsPurchased: 1,
  MaxCardsPurchased: 10,
  IsLocked: false,
  IsAdmin: false,
  IsActive: true,
  OnClick: jest.fn<() => void>(),
  OnEdit: jest.fn<() => void>(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GambitTableCard', () => {
  it('displays table name', () => {
    render(<GambitTableCard {...DefaultProps} />);
    expect(screen.getByText('Mesa Ouro')).toBeTruthy();
  });

  it('displays card price', () => {
    render(<GambitTableCard {...DefaultProps} />);
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('displays multiplier', () => {
    render(<GambitTableCard {...DefaultProps} />);
    expect(screen.getByText('2×')).toBeTruthy();
  });

  it('displays cards range', () => {
    render(<GambitTableCard {...DefaultProps} />);
    expect(screen.getByText('1 – 10')).toBeTruthy();
  });

  it('calls OnClick when clicking the card', () => {
    render(<GambitTableCard {...DefaultProps} />);
    fireEvent.click(screen.getByText('Mesa Ouro'));
    expect(DefaultProps.OnClick).toHaveBeenCalledTimes(1);
  });

  it('does not display edit button for non-admin', () => {
    render(<GambitTableCard {...DefaultProps} />);
    expect(screen.queryByText('Editar')).toBeNull();
  });

  it('displays edit button for admin', () => {
    render(<GambitTableCard {...DefaultProps} IsAdmin={true} />);
    expect(screen.getByText('Editar')).toBeTruthy();
  });

  it('calls OnEdit without propagating OnClick', () => {
    render(<GambitTableCard {...DefaultProps} IsAdmin={true} />);
    fireEvent.click(screen.getByText('Editar'));
    expect(DefaultProps.OnEdit).toHaveBeenCalledTimes(1);
    expect(DefaultProps.OnClick).not.toHaveBeenCalled();
  });

  it('displays locked overlay when IsLocked is true', () => {
    render(
      <GambitTableCard {...DefaultProps} IsLocked={true} IsAdmin={false} />
    );
    expect(screen.getByText('Bloqueado')).toBeTruthy();
  });

  it('displays deactivated overlay when IsActive is false and IsAdmin is true', () => {
    render(
      <GambitTableCard {...DefaultProps} IsActive={false} IsAdmin={true} />
    );
    expect(screen.getByText('Desativado')).toBeTruthy();
  });
});
