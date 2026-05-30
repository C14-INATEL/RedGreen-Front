import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CreateTableModal } from '../src/presentation/ui/CreateTabelModal';

type SlotMachineFromApi = {
  SlotMachineId: number;
  Name: string;
  Description: string;
  MinimumSpinValue: number;
  MinimumChipsRequired: number;
  MinimumRerollValue: number;
  Active: boolean;
};

const MockFetch = jest.fn<() => Promise<Partial<Response>>>();

const defaultProps = {
  Token: 'fake-token',
  OnClose: jest.fn<() => void>(),
  OnTableCreated: jest.fn<(table: SlotMachineFromApi) => void>(),
  OnError: jest.fn<(message: string) => void>(),
  OnSuccess: jest.fn<(message: string) => void>(),
};

beforeEach(() => {
  jest.clearAllMocks();
  globalThis.fetch = MockFetch as unknown as typeof fetch;
  MockFetch.mockReset();
});

const FillForm = (
  overrides: Partial<{
    name: string;
    bet: string;
    chips: string;
    reroll: string;
  }> = {}
) => {
  const {
    name = 'New Table',
    bet = '100',
    chips = '500',
    reroll = '50',
  } = overrides;
  fireEvent.change(screen.getByPlaceholderText('Nome da mesa'), {
    target: { value: name },
  });
  fireEvent.change(screen.getByPlaceholderText('Aposta mínima'), {
    target: { value: bet },
  });
  fireEvent.change(screen.getByPlaceholderText('Fichas mínimas'), {
    target: { value: chips },
  });
  fireEvent.change(screen.getByPlaceholderText('Valor do reroll'), {
    target: { value: reroll },
  });
};

describe('CreateTableModal', () => {
  it('renders all input fields', () => {
    render(<CreateTableModal {...defaultProps} />);
    expect(screen.getByPlaceholderText('Nome da mesa')).toBeTruthy();
    expect(screen.getByPlaceholderText('Aposta mínima')).toBeTruthy();
    expect(screen.getByPlaceholderText('Fichas mínimas')).toBeTruthy();
    expect(screen.getByPlaceholderText('Valor do reroll')).toBeTruthy();
  });

  it('calls OnError when name is empty', () => {
    render(<CreateTableModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Criar'));
    expect(defaultProps.OnError).toHaveBeenCalledWith(
      'O nome da mesa é obrigatório.'
    );
  });

  it('calls OnError when numeric fields are empty', () => {
    render(<CreateTableModal {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText('Nome da mesa'), {
      target: { value: 'Table' },
    });
    fireEvent.click(screen.getByText('Criar'));
    expect(defaultProps.OnError).toHaveBeenCalledWith(
      'Preencha todos os campos.'
    );
  });

  it('calls OnError when bet is zero', () => {
    render(<CreateTableModal {...defaultProps} />);
    FillForm({ bet: '0' });
    fireEvent.click(screen.getByText('Criar'));
    expect(defaultProps.OnError).toHaveBeenCalledWith(
      'A aposta mínima e o valor do reroll devem ser maiores que zero.'
    );
  });

  it('calls OnError when values are not integers', () => {
    render(<CreateTableModal {...defaultProps} />);
    FillForm({ bet: '1.5' });
    fireEvent.click(screen.getByText('Criar'));
    expect(defaultProps.OnError).toHaveBeenCalledWith(
      'A aposta mínima, fichas mínimas e valor do reroll devem ser números inteiros.'
    );
  });

  it('creates table successfully', async () => {
    const NewTable = { SlotMachineId: 99, Name: 'New Table', Active: true };
    MockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => NewTable,
    });

    render(<CreateTableModal {...defaultProps} />);
    FillForm();
    fireEvent.click(screen.getByText('Criar'));

    await waitFor(() => {
      expect(defaultProps.OnTableCreated).toHaveBeenCalledWith(NewTable);
      expect(defaultProps.OnSuccess).toHaveBeenCalledWith(
        'Mesa criada com sucesso!'
      );
      expect(defaultProps.OnClose).toHaveBeenCalled();
    });
  });

  it('calls OnError on API failure', async () => {
    MockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Duplicate name' }),
    });

    render(<CreateTableModal {...defaultProps} />);
    FillForm();
    fireEvent.click(screen.getByText('Criar'));

    await waitFor(() => {
      expect(defaultProps.OnError).toHaveBeenCalledWith('Duplicate name');
    });
  });

  it('calls OnClose when clicking cancel', () => {
    render(<CreateTableModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(defaultProps.OnClose).toHaveBeenCalledTimes(1);
  });
});
