const decodeBase64 = (encodedData:string) => {
    try {
        const decodedData = Buffer.from(encodedData, 'base64').toString('utf-8');
        return decodedData.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Elimina caracteres no imprimibles
    } catch (error) {
        console.error("Error al decodificar Base64:", error);
        return null;
    }
}

export default decodeBase64