import axios, { AxiosInstance } from 'axios';

export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api/v1/airgap',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-AirGap-Enclave': 'ISOLATED_LEVEL_4',
    'X-Zero-Egress-Policy': 'STRICT_ENFORCED',
    'X-Local-Runtime': 'ONNX_vLLM_DUAL_A6000',
    'X-Device-Id': 'LOCAL-NODE-PUNE-01',
  },
});

apiClient.interceptors.request.use((config) => {
  config.headers['X-Request-Timestamp'] = new Date().toISOString();
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('[AirGap API Interceptor]', error?.message || 'Local bus error');
    return Promise.reject(error);
  }
);