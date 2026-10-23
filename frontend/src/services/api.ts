import axios from 'axios';

// Instância centralizada do Axios apontando para o backend NestJS
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request: Injeta o token JWT automaticamente em cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Response: Redireciona para /login em caso de 401 (não autenticado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ignora a própria rota de login: ali o 401 significa "senha errada"
    // e o erro deve ser exibido no formulário, sem recarregar a página.
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
