// src/services/imagenService.js
import httpService from './httpService';

// Ruta base para los endpoints de imágenes (configurable)
const BASE_PATH = '/imagenes';

/**
 * Servicio centralizado para gestionar Imágenes de proyectos
 * Usa el proxy /api configurado en httpService
 *
 * Convenciones de API asumidas (donde ${BASE_PATH} es configurable):
 *  - Subir imagen:    POST   ${BASE_PATH}/subir
 *  - Obtener por ID:  GET    ${BASE_PATH}/:id
 */
const imagenService = {
    /**
     * Sube una imagen de proyecto
     * @param {FormData|File|Object} fileData - Puede ser FormData, File, o un objeto con el archivo y datos adicionales
     * @param {Object} [metadata] - Metadatos adicionales (proyectoId, descripcion, etc.)
     * @returns {Promise<Object>}
     */
    async subirImagen(fileData, metadata = {}) {
        let formData;

        // Si ya es FormData, usarlo directamente
        if (fileData instanceof FormData) {
            formData = fileData;
            // Agregar metadatos al FormData si se proporcionan
            Object.keys(metadata).forEach((key) => {
                formData.append(key, metadata[key]);
            });
        }
        // Si es un File, crear FormData
        else if (fileData instanceof File) {
            formData = new FormData();
            formData.append('imagen', fileData);
            Object.keys(metadata).forEach((key) => {
                formData.append(key, metadata[key]);
            });
        }
        // Si es un objeto con archivo y otros datos
        else if (fileData && typeof fileData === 'object') {
            formData = new FormData();
            // Buscar el archivo en el objeto
            if (fileData.file) {
                formData.append('imagen', fileData.file);
            } else if (fileData.imagen) {
                formData.append('imagen', fileData.imagen);
            }
            // Agregar todos los demás campos
            Object.keys(fileData).forEach((key) => {
                if (key !== 'file' && key !== 'imagen') {
                    formData.append(key, fileData[key]);
                }
            });
            // Agregar metadatos adicionales
            Object.keys(metadata).forEach((key) => {
                formData.append(key, metadata[key]);
            });
        } else {
            throw new Error('Formato de archivo no válido. Debe ser FormData, File u objeto con archivo.');
        }

        // Configurar headers para multipart/form-data (sin Content-Type para que el navegador lo establezca)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };

        return await httpService.post(`${BASE_PATH}/subir`, formData, config);
    },

    /**
     * Obtiene una imagen por ID
     * @param {string} id - ID de la imagen
     * @returns {Promise<Object|Blob>} - Puede retornar datos de la imagen o un Blob según la respuesta del servidor
     */
    async getImagenById(id) {
        return await httpService.get(`${BASE_PATH}/${id}`);
    },

    /**
     * Obtiene una imagen por ID como URL (para usar en <img src>)
     * @param {string} id - ID de la imagen
     * @returns {string} - URL de la imagen
     */
    getImagenUrl(id) {
        const token = localStorage.getItem('authToken');
        // Construir la URL con el token si es necesario
        const baseUrl = '/api';
        return token
            ? `${baseUrl}${BASE_PATH}/${id}?token=${token}`
            : `${baseUrl}${BASE_PATH}/${id}`;
    },
};

export default imagenService;

