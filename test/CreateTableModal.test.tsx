import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CreateTableModal } from '../src/presentation/ui/CreateTableModal';

type SlotMachineFromApi = {
  SlotMachineId: number;
  Name: string;
  Description: string;
  MinimumSpinValue: number;
  MinimumChipsRequired: number;
  MinimumRerollValue: number;
  Active: boolean;
};

type ApiPostMock = (
  Url: string,
  Payload?: Record<string, unknown>
) => Promise<{ data: Record<string, unknown>; status?: number }>;

const MockApiPost = jest.fn<ApiPostMock>();

jest.mock('@infrastructure/http/client', () => ({
  apiClient: {
    post: (Url: string, Payload?: Record<string, unknown>) =>
      MockApiPost(Url, Payload),
  },
}));

const DefaultProps = {
  OnClose: jest.fn<() => void>(),
  OnTableCreated: jest.fn<(Table: SlotMachineFromApi) => void>(),
  OnError: jest.fn<(Message: string) => void>(),
  OnSuccess: jest.fn<(Message: string) => void>(),
};

beforeEach(() => {
  jest.clearAllMocks();
  MockApiPost.mockReset();
});

const FillForm = (
  Overrides: Partial<{
    Name: string;
    Bet: string;
    Chips: string;
    Reroll: string;
  }> = {}
) => {
  const {
    Name = 'New Table',
    Bet = '100',
    Chips = '500',
    Reroll = '50',
  } = Overrides;

  fireEvent.change(screen.getByPlaceholderText('Nome da mesa'), {
    target: { value: Name },
  });
  fireEvent.change(screen.getByPlaceholderText(/Aposta/i), {
    target: { value: Bet },
  });
  fireEvent.change(screen.getByPlaceholderText(/Fichas/i), {
    target: { value: Chips },
  });
  fireEvent.change(screen.getByPlaceholderText('Valor do reroll'), {
    target: { value: Reroll },
  });
};

describe('CreateTableModal', () => {
  it('renders all input fields', () => {
    render(<CreateTableModal {...DefaultProps} />);
    expect(screen.getByPlaceholderText('Nome da mesa')).toBeTruthy();
    expect(screen.getByPlaceholderText(/Aposta/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Fichas/i)).toBeTruthy();
    expect(screen.getByPlaceholderText('Valor do reroll')).toBeTruthy();
  });

  it('calls OnError when name is empty', () => {
    render(<CreateTableModal {...DefaultProps} />);
    fireEvent.click(screen.getByText('Criar'));
    expect(DefaultProps.OnError).toHaveBeenCalledWith(
      expect.stringContaining('O nome da mesa')
    );
  });

  it('calls OnError when numeric fields are empty', () => {
    render(<CreateTableModal {...DefaultProps} />);
    fireEvent.change(screen.getByPlaceholderText('Nome da mesa'), {
      target: { value: 'Table' },
    });
    fireEvent.click(screen.getByText('Criar'));
    expect(DefaultProps.OnError).toHaveBeenCalledWith(
      'Preencha todos os campos.'
    );
  });

  it('calls OnError when bet is zero', () => {
    render(<CreateTableModal {...DefaultProps} />);
    FillForm({ Bet: '0' });
    fireEvent.click(screen.getByText('Criar'));
    expect(DefaultProps.OnError).toHaveBeenCalledWith(
      expect.stringContaining('valor do reroll devem ser maiores que zero')
    );
  });

  it('calls OnError when values are not integers', () => {
    render(<CreateTableModal {...DefaultProps} />);
    FillForm({ Bet: '1.5' });
    fireEvent.click(screen.getByText('Criar'));
    expect(DefaultProps.OnError).toHaveBeenCalledWith(
      expect.stringContaining('valor do reroll devem ser')
    );
  });

  it('creates table successfully', async () => {
    const NewTable = { SlotMachineId: 99, Name: 'New Table', Active: true };
    MockApiPost.mockResolvedValueOnce({
      data: NewTable,
      status: 200,
    });

    render(<CreateTableModal {...DefaultProps} />);
    FillForm();
    fireEvent.click(screen.getByText('Criar'));

    await waitFor(() => {
      expect(MockApiPost).toHaveBeenCalledWith(
        '/slot/machine',
        expect.objectContaining({
          Name: 'New Table',
        })
      );
      expect(DefaultProps.OnTableCreated).toHaveBeenCalledWith(NewTable);
      expect(DefaultProps.OnSuccess).toHaveBeenCalledWith(
        'Mesa criada com sucesso!'
      );
      expect(DefaultProps.OnClose).toHaveBeenCalled();
    });
  });

  it('calls OnError on API failure', async () => {
    MockApiPost.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Duplicate name',
        },
      },
    });

    render(<CreateTableModal {...DefaultProps} />);
    FillForm();
    fireEvent.click(screen.getByText('Criar'));

    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith('Duplicate name');
    });
  });

  it('calls OnClose when clicking cancel', () => {
    render(<CreateTableModal {...DefaultProps} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(DefaultProps.OnClose).toHaveBeenCalledTimes(1);
  });
});
