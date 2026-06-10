import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CreateGambitTableModal } from '../src/presentation/ui/Gambit/CreateGambitModal';

jest.mock('../src/infrastructure/http/client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

import { apiClient } from '../src/infrastructure/http/client';

const DefaultProps = {
  OnClose: jest.fn<() => void>(),
  OnTableCreated: jest.fn<(table: unknown) => void>(),
  OnError: jest.fn<(message: string) => void>(),
  OnSuccess: jest.fn<(message: string) => void>(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

const FillForm = () => {
  fireEvent.change(screen.getByPlaceholderText('Nome da mesa'), {
    target: { value: 'Mesa Teste' },
  });
  fireEvent.change(screen.getByPlaceholderText('Fichas mínimas'), {
    target: { value: '100' },
  });
  fireEvent.change(screen.getByPlaceholderText('Preço por carta'), {
    target: { value: '10' },
  });
  fireEvent.change(screen.getByPlaceholderText('Multiplicador da mesa'), {
    target: { value: '2' },
  });
  fireEvent.change(screen.getByPlaceholderText('Mínimo de cartas'), {
    target: { value: '1' },
  });
  fireEvent.change(screen.getByPlaceholderText('Máximo de cartas'), {
    target: { value: '10' },
  });
};

describe('CreateGambitTableModal', () => {
  it('renders the modal', () => {
    render(<CreateGambitTableModal {...DefaultProps} />);
    expect(screen.getByText('Criar Mesa')).toBeTruthy();
  });

  it('calls OnClose when clicking Cancelar', () => {
    render(<CreateGambitTableModal {...DefaultProps} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(DefaultProps.OnClose).toHaveBeenCalledTimes(1);
  });

  it('calls OnError when table name is empty', async () => {
    render(<CreateGambitTableModal {...DefaultProps} />);
    fireEvent.click(screen.getByText('Criar'));
    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith(
        'O nome da mesa é obrigatório.'
      );
    });
  });

  it('calls OnError when table name is only whitespace', async () => {
    render(<CreateGambitTableModal {...DefaultProps} />);
    fireEvent.change(screen.getByPlaceholderText('Nome da mesa'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByText('Criar'));
    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith(
        'O nome da mesa é obrigatório.'
      );
    });
  });

  it('calls OnError when fields are empty', async () => {
    render(<CreateGambitTableModal {...DefaultProps} />);
    fireEvent.change(screen.getByPlaceholderText('Nome da mesa'), {
      target: { value: 'Mesa Teste' },
    });
    fireEvent.click(screen.getByText('Criar'));
    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith(
        'Preencha todos os campos.'
      );
    });
  });

  it('calls OnError when CardPrice is zero', async () => {
    render(<CreateGambitTableModal {...DefaultProps} />);
    FillForm();
    fireEvent.change(screen.getByPlaceholderText('Preço por carta'), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByText('Criar'));
    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith(
        'Os valores devem ser maiores que zero.'
      );
    });
  });

  it('calls OnError when TableMultiplier is zero', async () => {
    render(<CreateGambitTableModal {...DefaultProps} />);
    FillForm();
    fireEvent.change(screen.getByPlaceholderText('Multiplicador da mesa'), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByText('Criar'));
    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith(
        'Os valores devem ser maiores que zero.'
      );
    });
  });

  it('calls OnError when MinimumChips is negative', async () => {
    render(<CreateGambitTableModal {...DefaultProps} />);
    FillForm();
    fireEvent.change(screen.getByPlaceholderText('Fichas mínimas'), {
      target: { value: '-1' },
    });
    fireEvent.click(screen.getByText('Criar'));
    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith(
        'Os valores devem ser maiores que zero.'
      );
    });
  });

  it('calls OnError when MaxCardsPurchased exceeds 25', async () => {
    render(<CreateGambitTableModal {...DefaultProps} />);
    FillForm();
    fireEvent.change(screen.getByPlaceholderText('Máximo de cartas'), {
      target: { value: '26' },
    });
    fireEvent.click(screen.getByText('Criar'));
    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith(
        'O máximo de cartas não pode ultrapassar 25.'
      );
    });
  });

  it('calls OnError when MinimumCardsPurchased >= MaxCardsPurchased', async () => {
    render(<CreateGambitTableModal {...DefaultProps} />);
    FillForm();
    fireEvent.change(screen.getByPlaceholderText('Mínimo de cartas'), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByPlaceholderText('Máximo de cartas'), {
      target: { value: '10' },
    });
    fireEvent.click(screen.getByText('Criar'));
    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith(
        'O máximo de cartas deve ser maior que o mínimo.'
      );
    });
  });

  it('calls OnError when MinimumCardsPurchased is greater than MaxCardsPurchased', async () => {
    render(<CreateGambitTableModal {...DefaultProps} />);
    FillForm();
    fireEvent.change(screen.getByPlaceholderText('Mínimo de cartas'), {
      target: { value: '15' },
    });
    fireEvent.change(screen.getByPlaceholderText('Máximo de cartas'), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByText('Criar'));
    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith(
        'O máximo de cartas deve ser maior que o mínimo.'
      );
    });
  });

  it('calls OnError when CardPrice is not integer', async () => {
    render(<CreateGambitTableModal {...DefaultProps} />);
    FillForm();
    fireEvent.change(screen.getByPlaceholderText('Preço por carta'), {
      target: { value: '1.5' },
    });
    fireEvent.click(screen.getByText('Criar'));
    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith(
        'Os valores devem ser números inteiros.'
      );
    });
  });

  it('calls OnError when MinimumCardsPurchased is not integer', async () => {
    render(<CreateGambitTableModal {...DefaultProps} />);
    FillForm();
    fireEvent.change(screen.getByPlaceholderText('Mínimo de cartas'), {
      target: { value: '1.5' },
    });
    fireEvent.click(screen.getByText('Criar'));
    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith(
        'Os valores devem ser números inteiros.'
      );
    });
  });

  it('calls OnError when MaxCardsPurchased is not integer', async () => {
    render(<CreateGambitTableModal {...DefaultProps} />);
    FillForm();
    fireEvent.change(screen.getByPlaceholderText('Máximo de cartas'), {
      target: { value: '10.5' },
    });
    fireEvent.click(screen.getByText('Criar'));
    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith(
        'Os valores devem ser números inteiros.'
      );
    });
  });

  it('calls OnError when MinimumChips is not integer', async () => {
    render(<CreateGambitTableModal {...DefaultProps} />);
    FillForm();
    fireEvent.change(screen.getByPlaceholderText('Fichas mínimas'), {
      target: { value: '100.5' },
    });
    fireEvent.click(screen.getByText('Criar'));
    await waitFor(() => {
      expect(DefaultProps.OnError).toHaveBeenCalledWith(
        'Os valores devem ser números inteiros.'
      );
    });
  });
});
