import { HfInference } from "@huggingface/inference";


async function classifyEmails(texts: string[]) {
    const classifiedResults: any = [];
    const hf = new HfInference(process.env.HF_TOKEN) 
    
    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        const cleanText = text.length > 1000 ? text.slice(0, 1000) : text;
        
  try {
    const result = await hf.zeroShotClassification({
      model: "facebook/bart-large-mnli",
      inputs: cleanText,
      parameters: {
        candidate_labels: [    
            'appointment',
            'date',
            'time',
            'hour',
            'schedule',
            'meeting',
            'interview',
            'due date'],
        multi_label: true,
      },
    });
  
    const typedResult = result as any;

    if (typedResult && typedResult.labels && typedResult.scores) {
        console.log("📨 Texto del correo:\n", cleanText);
        console.log("🏷️ Etiquetas:", typedResult.labels);
        console.log("📊 Puntuaciones:", typedResult.scores);
    } else {
      console.warn("⚠️ Resultado vacío:", result);
    }

    classifiedResults.push({
      ...result,
      sequence: cleanText,
    });

  } catch (error) {
    console.error("❌ Error al clasificar el texto:", error);
    classifiedResults.push({
      labels: [],
      scores: [],
      sequence: cleanText,
      error: true,
    });
  }

  await new Promise(resolve => setTimeout(resolve, 10000)); // evitar sobrecarga de Hugging Face API
}

    return classifiedResults;
}

export default classifyEmails;