import { HfInference } from "@huggingface/inference";


async function classifyEmails(texts: string[]) {
    const classifiedResults: any = [];
    const hf = new HfInference(process.env.HF_TOKEN) 

    for (const text of texts) {
        try {
            const result = await hf.zeroShotClassification({
                model: "facebook/bart-large-mnli",
                inputs: text,
                parameters: {
                  sequence_to_classify:text,
                  candidate_labels: ["appointment", "meeting", "bill", "event", "schedule", "interview", "due date", "payment"],
                  multi_label:true,
                },
            });

                    // 👇 Logs para entender cómo clasifica cada correo
                    const labels = (result as any).labels;
                    const scores = (result as any).scores;

                    console.log("📨 Texto del correo:");
                    console.log(text);
                    console.log("🏷️ Etiquetas:", labels);
                    console.log("📊 Puntuaciones:", scores);
                    
            await new Promise(resolve => setTimeout(resolve, 4000));
            classifiedResults.push(result);

        } catch (error) {
            console.error("Error al clasificar el texto:", error);
            classifiedResults.push("error"); // Manejo de error
        }
    }

    return classifiedResults;
}

export default classifyEmails;