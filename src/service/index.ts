import api from './api';

export const sendMessage = async (content: string) => {
  return api.post('/api/v1/chat', { content });  
}
