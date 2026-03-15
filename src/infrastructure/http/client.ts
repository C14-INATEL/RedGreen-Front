import axios from 'axios';
import { config } from '../../config';

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
});

// Interceptors podem ser adicionados aqui
