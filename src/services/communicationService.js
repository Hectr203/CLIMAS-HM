// src/services/communicationService.js
import httpService from './httpService';

const communicationService = {
  async createCommunication(data) {
    // POST al endpoint comunicacion/crear
    const response = await httpService.post('/comunicacion/crear', data);
    return response;
  },
};

export default communicationService;
