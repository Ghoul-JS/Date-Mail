const decodeBase64 = (encodedData: string): string => {
    try {
        // Base64 URL-safe → Base64 estándar
        let fixedData = encodedData.replace(/-/g, '+').replace(/_/g, '/');
        // Agrega padding si falta
        while (fixedData.length % 4 !== 0) {
            fixedData += '=';
        }

        const decoded = Buffer.from(fixedData, 'base64').toString('utf-8');
        // Opcional: eliminar caracteres no imprimibles
        return decoded.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    } catch (error) {
        console.error("Error al decodificar Base64:", error);
        return '';
    }
};

export default decodeBase64