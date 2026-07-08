import axios from 'axios';

const AI_BASE_URL =
  import.meta.env.VITE_AI_API_URL ||
  'https://healtsync-ai-api.onrender.com';
export const aiClient = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const aiService = {
  getForecast: async (): Promise<any> => {
    const response = await aiClient.get('/forecast');
    return response.data;
  },

  getHealth: async (): Promise<any> => {
    const response = await aiClient.get('/health');
    return response.data;
  },

  getStockout: async (): Promise<any> => {
    const response = await aiClient.get('/stockout');
    return response.data;
  },

  getAlerts: async (): Promise<any> => {
    const response = await aiClient.get('/alerts');
    return response.data;
  },

  getRecommendations: async (): Promise<any> => {
    const response = await aiClient.get('/recommendations');
    return response.data;
  },
  
  getPipelineRun: async (): Promise<any> => {
    const response = await aiClient.get('/pipeline/run');
    return response.data;
  }
};
