// services/ordenCompraService.js
import httpService from "./httpService";

const ordenCompraService = {
    async getOrdenes() {
        try {
            const data = await httpService.get("/ordenCompra/todas");
            return data;
        } catch (error) {
            console.error("Error al obtener órdenes de compra:", error);
            throw error;
        }
    },

    async getOrdenById(id) {
        try {
            const data = await httpService.get(`/ordenCompra/detalle/${id}`);
            return data;
        } catch (error) {
            console.error(`Error al obtener la orden de compra con ID ${id}:`, error);
            throw error;
        }
    },

    async getOrdenByNumero(numeroOrden) {
        try {
            const data = await httpService.get(`/ordenCompra/numero/${numeroOrden}`);
            return data;
        } catch (error) {
            console.error(`Error al obtener la orden de compra número ${numeroOrden}:`, error);
            throw error;
        }
    },

    async createOrden(payload) {
        try {
            const data = await httpService.post("/ordenCompra/crear", payload);
            return data;
        } catch (error) {
            console.error("Error al crear orden de compra:", error);
            throw error;
        }
    },

    async updateOrden(id, payload) {
        try {
            const data = await httpService.put(`/ordenCompra/editar/${id}`, payload);
            return data;
        } catch (error) {
            console.error(`Error al actualizar la orden de compra con ID ${id}:`, error);
            throw error;
        }
    },

    async deleteOrden(id) {
        try {
            const data = await httpService.delete(`/ordenCompra/eliminar/${id}`);
            return data;
        } catch (error) {
            console.error(`Error al eliminar la orden de compra con ID ${id}:`, error);
            throw error;
        }
    },

    async hardDeleteOrden(id) {
        try {
            const data = await httpService.delete(`/ordenCompra/hardDelete/${id}`);
            return data;
        } catch (error) {
            console.error(`Error al eliminar permanentemente la orden de compra con ID ${id}:`, error);
            throw error;
        }
    },

    async getOrdenesEliminadas() {
        try {
            const data = await httpService.get("/ordenCompra/eliminadas");
            return data;
        } catch (error) {
            console.error("Error al obtener órdenes de compra eliminadas:", error);
            throw error;
        }
    },

    async restaurarOrden(id) {
        try {
            const data = await httpService.put(`/ordenCompra/restaurar/${id}`);
            return data;
        } catch (error) {
            console.error(`Error al restaurar la orden de compra con ID ${id}:`, error);
            throw error;
        }
    }
};

export default ordenCompraService;
