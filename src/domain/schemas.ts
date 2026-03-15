import { z } from 'zod';

// Schemas de validação
export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  email: z.string().email(),
});

export const walletSchema = z.object({
  balance: z.number().min(0),
  currency: z.string(),
});
