import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { SlotMachineCard } from '../src/presentation/ui/SlotMachineCard';

const defaultProps = {
  SlotMachineId: 1,
  Name: 'Gold Table',
  MinimumSpinValue: 100,
  MinimumChipsRequired: 500,
  IsLocked: false,
  IsAdmin: false,
  OnClick: jest.fn<() => void>(),
  OnDelete: jest.fn<() => void>(),
};

beforeEach(async () => jest.clearAllMocks());

describe('SlotMachineCard', () => {
  it('displays table name', () => {
    render(<SlotMachineCard {...defaultProps} />);
    expect(screen.getByText('Gold Table')).toBeTruthy();
  });

  it('calls OnClick when clicking the card', () => {
    render(<SlotMachineCard {...defaultProps} />);
    fireEvent.click(screen.getByText('Gold Table'));
    expect(defaultProps.OnClick).toHaveBeenCalledTimes(1);
  });

  it('does not display delete button for non-admin', () => {
    render(<SlotMachineCard {...defaultProps} />);
    expect(screen.queryByText('Excluir')).toBeNull();
  });

  it('displays delete button for admin', () => {
    render(<SlotMachineCard {...defaultProps} IsAdmin={true} />);
    expect(screen.getByText('Excluir')).toBeTruthy();
  });

  it('calls OnDelete without propagating OnClick', () => {
    render(<SlotMachineCard {...defaultProps} IsAdmin={true} />);
    fireEvent.click(screen.getByText('Excluir'));
    expect(defaultProps.OnDelete).toHaveBeenCalledTimes(1);
    expect(defaultProps.OnClick).not.toHaveBeenCalled();
  });

  it('displays locked overlay when IsLocked is true', () => {
    render(<SlotMachineCard {...defaultProps} IsLocked={true} />);
    expect(screen.getByText('Bloqueado')).toBeTruthy();
  });
});
