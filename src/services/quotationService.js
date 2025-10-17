// quotationService.js
import httpService from "./httpService";

const quotationService = {
  async createQuotation(data) {
    try {
      const response = await httpService.post("cotizacion/crear", data);
      return response.data;
    } catch (error) {
      console.error("Error creating quotation:", error);
      throw error;
    }
  },
};

export default quotationService;
