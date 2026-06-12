import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EditTableModal } from '../src/presentation/ui/EditTableModal';

type MockFn = ReturnType<typeof jest.fn> & {
  mockResolvedValueOnce: (value: unknown) => void;
  mockRejectedValueOnce: (value: unknown) => void;
};

const MockApiDelete = jest.fn() as unknown as MockFn;
const MockApiPut = jest.fn() as unknown as MockFn;
const MockApiPatch = jest.fn() as unknown as MockFn;
const MockApiGet = jest.fn() as unknown as MockFn;

jest.mock('@infrastructure/http/client', () => ({
  apiClient: {
    delete: (Url: string) => MockApiDelete(Url),
    put: (Url: string, Body: unknown) => MockApiPut(Url, Body),
    patch: (Url: string) => MockApiPatch(Url),
    get: (Url: string) => MockApiGet(Url),
  },
}));

const DefaultProps = {
  TableId: 1,
  TableName: 'Test Table',
  TableMinimumSpinValue: 10,
  TableMinimumChipsRequired: 100,
  TableMinimumRerollValue: 5,
  TableActive: false,
  OnClose: jest.fn<() => void>(),
  OnSuccess: jest.fn<(Message: string) => void>(),
  OnError: jest.fn<(Message: string) => void>(),
  OnTableDeleted: jest.fn<(Id: number) => void>(),
  OnTableUpdated: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('EditTableModal', () => {
  it('displays the table name', () => {
    render(<EditTableModal {...DefaultProps} />);
    expect(screen.getByText('Test Table')).toBeTruthy();
  });

  it('calls OnClose when clicking cancel', () => {
    render(<EditTableModal {...DefaultProps} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(DefaultProps.OnClose).toHaveBeenCalledTimes(1);
  });

  it('calls OnTableDeleted and OnSuccess on successful delete when table is inactive', async () => {
    MockApiDelete.mockResolvedValueOnce({} as unknown);

    render(<EditTableModal {...DefaultProps} TableActive={false} />);
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

  it('delete button is disabled when table is active', () => {
    render(<EditTableModal {...DefaultProps} TableActive={true} />);
    const DeleteButton = screen.getByText('Excluir').closest('button');
    expect(DeleteButton).toHaveProperty('disabled', true);
  });

  it('calls OnError when API rejects with a response on delete', async () => {
    MockApiDelete.mockRejectedValueOnce({
      response: { status: 409 },
    } as unknown);

    render(<EditTableModal {...DefaultProps} TableActive={false} />);
    fireEvent.click(screen.getByText('Excluir'));

    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith(
        'Não é possível excluir a mesa pois há sessões ativas.'
      );
    });
  });

  it('calls OnTableUpdated and OnSuccess on successful save', async () => {
    MockApiPut.mockResolvedValueOnce({ data: { SlotMachineId: 1 } } as unknown);

    render(<EditTableModal {...DefaultProps} />);
    fireEvent.click(screen.getByText('Salvar'));

    await waitFor(() => {
      expect(MockApiPut).toHaveBeenCalledWith(
        '/slot/machine/1',
        expect.any(Object)
      );
      expect(DefaultProps.OnTableUpdated).toHaveBeenCalled();
      expect(DefaultProps.OnSuccess).toHaveBeenCalledWith(
        'Mesa atualizada com sucesso!'
      );
    });
  });

  it('calls OnSuccess when deactivating table without active sessions', async () => {
    MockApiGet.mockResolvedValueOnce({ data: [] } as unknown);
    MockApiPatch.mockResolvedValueOnce({} as unknown);

    render(<EditTableModal {...DefaultProps} TableActive={true} />);
    fireEvent.click(screen.getByText('Desativar'));

    await waitFor(() => {
      expect(MockApiPatch).toHaveBeenCalledWith('/slot/machine/1/deactivate');
      expect(DefaultProps.OnSuccess).toHaveBeenCalledWith(
        'Mesa desativada com sucesso!'
      );
    });
  });
});
