import axios from "axios"
import createConfig from "./utils";
import decodeBase64 from "./decodeBase64";
import extractPlainTextPart from "./extraPlainText"

const getFullMessage = async(email: string, threadId: string, token: string) => {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${email}/threads/${threadId}`;
        const config = createConfig(url, token);
        const response = await axios(config);

        // Tomamos el último mensaje del hilo
        const messages = response.data.messages;
        const lastMessage = messages[messages.length - 1];

        // Obtener el contenido del correo
        // const bodyData = lastMessage.payload.parts?.[0]?.body?.data || "";
        const rawData = extractPlainTextPart(lastMessage.payload) || "";
        const decodedMessage = decodeBase64(rawData);

        return {
            id: lastMessage.id,
            snippet: lastMessage.snippet,
            fullMessage: decodedMessage
        };
    } catch (error) {
        console.error(`Error fetching message ${threadId}:`, error);
        return null;
    }
}

export default getFullMessage