import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DeleteTableModal } from '../src/presentation/ui/DeleteTableModal';

const MockFetch = jest.fn<() => Promise<Partial<Response>>>();

const defaultProps = {
  TableName: 'Test Table',
  TableId: 1,
  Token: 'fake-token',
  OnClose: jest.fn<() => void>(),
  OnSuccess: jest.fn<(message: string) => void>(),
  OnError: jest.fn<(message: string) => void>(),
  OnTableDeleted: jest.fn<(id: number) => void>(),
};

beforeEach(() => {
  jest.clearAllMocks();
  globalThis.fetch = MockFetch as unknown as typeof fetch;
  MockFetch.mockReset();
});

describe('DeleteTableModal', () => {
  it('displays the table name', () => {
    render(<DeleteTableModal {...defaultProps} />);
    expect(screen.getByText('Test Table')).toBeTruthy();
  });

  it('calls OnClose when clicking cancel', () => {
    render(<DeleteTableModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(defaultProps.OnClose).toHaveBeenCalledTimes(1);
  });

  it('calls OnTableDeleted and OnSuccess on successful delete', async () => {
    MockFetch.mockResolvedValueOnce({ ok: true });

    render(<DeleteTableModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Excluir'));

    await waitFor(() => {
      expect(defaultProps.OnTableDeleted).toHaveBeenCalledWith(1);
      expect(defaultProps.OnSuccess).toHaveBeenCalledWith(
        'Mesa removida com sucesso.'
      );
      expect(defaultProps.OnClose).toHaveBeenCalled();
    });
  });

  it('calls OnError when response is not ok', async () => {
    MockFetch.mockResolvedValueOnce({ ok: false });

    render(<DeleteTableModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Excluir'));

    await waitFor(() => {
      expect(defaultProps.OnError).toHaveBeenCalledWith(
        'Não é possível excluir a mesa pois há sessões ativas.'
      );
    });
  });

  it('calls OnError on network failure', async () => {
    MockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<DeleteTableModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Excluir'));

    await waitFor(() => {
      expect(defaultProps.OnError).toHaveBeenCalledWith('Network error');
    });
  });
});
