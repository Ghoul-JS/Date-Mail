function extractPlainTextPart(payload: any): string | null {
    if (payload.mimeType === "text/plain" && payload.body?.data) {
        return payload.body.data;
    }

    if (payload.parts && Array.isArray(payload.parts)) {
        for (const part of payload.parts) {
            const result = extractPlainTextPart(part);
            if (result) return result;
        }
    }

    return null;
}

export default extractPlainTextPart