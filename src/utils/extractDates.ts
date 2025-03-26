import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN)


const extractDates = async(text:string) => {
    const result = await hf.tokenClassification({
        model: "Jean-Baptiste/camembert-ner-with-dates",
        inputs: text
    });
    console.log("result: ", result);
    
    return result.filter(entity => entity.entity_group === "DATE");
}

export default extractDates