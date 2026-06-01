import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ResultModal } from '../src/presentation/ui/ResultModal';

const OnClose = jest.fn<() => void>();

beforeEach(() => {
  OnClose.mockClear();
});

describe('ResultModal', () => {
  it('renders title and message', () => {
    render(
      <ResultModal
        Title="Success"
        Message="Table created!"
        Type="success"
        OnClose={OnClose}
      />
    );
    expect(screen.getByText('Success')).toBeTruthy();
    expect(screen.getByText('Table created!')).toBeTruthy();
  });

  it('calls OnClose when clicking OK', () => {
    render(
      <ResultModal
        Title="Error"
        Message="Something went wrong."
        Type="error"
        OnClose={OnClose}
      />
    );
    fireEvent.click(screen.getByText('OK'));
    expect(OnClose).toHaveBeenCalledTimes(1);
  });

  it('applies green border on success type', () => {
    const { container: Container } = render(
      <ResultModal
        Title="OK"
        Message="Done."
        Type="success"
        OnClose={OnClose}
      />
    );
    const El = Container.firstChild?.firstChild as HTMLElement;
    expect(El.className).toContain('border-[hsl(120,50%,35%)]');
  });

  it('applies red border on error type', () => {
    const { container: Container } = render(
      <ResultModal
        Title="Error"
        Message="Failed."
        Type="error"
        OnClose={OnClose}
      />
    );
    const El = Container.firstChild?.firstChild as HTMLElement;
    expect(El.className).toContain('border-[#ff4444]');
  });
});
