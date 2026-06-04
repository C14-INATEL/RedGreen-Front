import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DeleteTableModal } from '../src/presentation/ui/DeleteTableModal';

type ApiDeleteMock = (Url: string) => Promise<unknown>;

const MockApiDelete = jest.fn<ApiDeleteMock>();

jest.mock('@infrastructure/http/client', () => ({
  apiClient: {
    delete: (Url: string) => MockApiDelete(Url),
  },
}));

const DefaultProps = {
  TableName: 'Test Table',
  TableId: 1,
  OnClose: jest.fn<() => void>(),
  OnSuccess: jest.fn<(Message: string) => void>(),
  OnError: jest.fn<(Message: string) => void>(),
  OnTableDeleted: jest.fn<(Id: number) => void>(),
};

beforeEach(() => {
  jest.clearAllMocks();
  MockApiDelete.mockReset();
});

describe('DeleteTableModal', () => {
  it('displays the table name', () => {
    render(<DeleteTableModal {...DefaultProps} />);
    expect(screen.getByText('Test Table')).toBeTruthy();
  });

  it('calls OnClose when clicking cancel', () => {
    render(<DeleteTableModal {...DefaultProps} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(DefaultProps.OnClose).toHaveBeenCalledTimes(1);
  });

  it('calls OnTableDeleted and OnSuccess on successful delete', async () => {
    MockApiDelete.mockResolvedValueOnce({});

    render(<DeleteTableModal {...DefaultProps} />);
    fireEvent.click(screen.getByText('Excluir'));

    await waitFor(() => {
      expect(MockApiDelete).toHaveBeenCalledWith('/slot/machine/1');
      expect(DefaultProps.OnTableDeleted).toHaveBeenCalledWith(1);
      expect(DefaultProps.OnSuccess).toHaveBeenCalledWith(
        'Mesa removida com sucesso.'
      );
      expect(DefaultProps.OnClose).toHaveBeenCalled();
    });
  });

  it('calls OnError when API rejects with a response', async () => {
    MockApiDelete.mockRejectedValueOnce({
      response: {
        status: 409,
      },
    });

    render(<DeleteTableModal {...DefaultProps} />);
    fireEvent.click(screen.getByText('Excluir'));

    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith(
        'Nao e possivel excluir a mesa pois ha sessoes ativas.'
      );
    });
  });

  it('calls OnError on network failure', async () => {
    MockApiDelete.mockRejectedValueOnce(new Error('Network error'));

    render(<DeleteTableModal {...DefaultProps} />);
    fireEvent.click(screen.getByText('Excluir'));

    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith('Network error');
    });
  });
});
