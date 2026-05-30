import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { SessionWarningModal } from '../src/presentation/ui/SessionWarningModal';

const OnClose = jest.fn<() => void>();

beforeEach(() => {
  OnClose.mockClear();
});

describe('SessionWarningModal', () => {
  it('displays the machine name', () => {
    render(<SessionWarningModal MachineName="VIP Table" OnClose={OnClose} />);
    expect(screen.getByText('VIP Table')).toBeTruthy();
  });

  it('displays active session warning text', () => {
    render(<SessionWarningModal MachineName="VIP Table" OnClose={OnClose} />);
    expect(screen.getByText(/sessão ativa/i)).toBeTruthy();
  });

  it('calls OnClose when clicking OK', () => {
    render(<SessionWarningModal MachineName="VIP Table" OnClose={OnClose} />);
    fireEvent.click(screen.getByText('OK'));
    expect(OnClose).toHaveBeenCalledTimes(1);
  });
});
