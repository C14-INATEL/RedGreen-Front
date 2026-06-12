import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { SlotMachineCard } from '../src/presentation/ui/SlotMachineCard';

const DefaultProps = {
  SlotMachineId: 1,
  Name: 'Gold Table',
  MinimumSpinValue: 100,
  MinimumChipsRequired: 500,
  MinimumRerollValue: 50,
  IsLocked: false,
  IsAdmin: false,
  IsActive: true,
  OnClick: jest.fn<() => void>(),
  OnEdit: jest.fn<() => void>(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SlotMachineCard', () => {
  it('displays table name', () => {
    render(<SlotMachineCard {...DefaultProps} />);
    expect(screen.getByText('Gold Table')).toBeTruthy();
  });

  it('calls OnClick when clicking the card', () => {
    render(<SlotMachineCard {...DefaultProps} />);
    fireEvent.click(screen.getByText('Gold Table'));
    expect(DefaultProps.OnClick).toHaveBeenCalledTimes(1);
  });

  it('does not display edit button for non-admin', () => {
    render(<SlotMachineCard {...DefaultProps} />);
    expect(screen.queryByText('Editar')).toBeNull();
  });

  it('displays edit button for admin', () => {
    render(<SlotMachineCard {...DefaultProps} IsAdmin={true} />);
    expect(screen.getByText('Editar')).toBeTruthy();
  });

  it('calls OnEdit without propagating OnClick', () => {
    render(<SlotMachineCard {...DefaultProps} IsAdmin={true} />);
    fireEvent.click(screen.getByText('Editar'));
    expect(DefaultProps.OnEdit).toHaveBeenCalledTimes(1);
    expect(DefaultProps.OnClick).not.toHaveBeenCalled();
  });

  it('displays locked overlay when IsLocked is true and not admin', () => {
    render(
      <SlotMachineCard {...DefaultProps} IsLocked={true} IsAdmin={false} />
    );
    expect(screen.getByText('Bloqueado')).toBeTruthy();
  });

  it('displays deactivated overlay when IsActive is false and IsAdmin is true', () => {
    render(
      <SlotMachineCard {...DefaultProps} IsActive={false} IsAdmin={true} />
    );
    expect(screen.getByText('Desativado')).toBeTruthy();
  });
});
