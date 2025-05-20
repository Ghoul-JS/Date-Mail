import axios from "axios"
import createConfig from "../utils/utils"
import { google } from "googleapis";
import { Request, Response } from "express";
import { HfInference } from "@huggingface/inference";
import decodeBase64 from "../utils/decodeBase64";
import extractDates from "../utils/extractDates";
import getFullMessage from "../utils/getFullMessage"
import classifyEmails from "../utils/clasifyMail";
import xdd from "../utils/extraerCorreosConFechas"
import userModel from "../models/user.model";
import { AuthRequest } from "../types/AuthRequest";
import { createGoogleEvents } from '../services/calendar.service';
import verifyLenguage from "../utils/verifyLenguage"


const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
);

oAuth2Client.setCredentials({
    // access_token: process.env.ACCESS_TOKEN, 
    refresh_token: process.env.REFRESH_TOKEN
});

async function getMails(req: AuthRequest, res: Response): Promise<void> {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/threads?maxResults=30`;
        // const token = (await oAuth2Client.getAccessToken()).token ?? "";
        const hf = new HfInference(process.env.HF_TOKEN)

        const user = await userModel.findById(req.user?._id);

        oAuth2Client.setCredentials({
            access_token: user?.google?.accessToken,
            refresh_token: user?.google?.refreshToken,
        });

        const token = (await oAuth2Client.getAccessToken()).token ?? "";
        const config = createConfig(url, token);
        const response = await axios(config);

        console.log("user: ", user);

        if (!user || !user.google) {
            res.status(401).json({ message: "Usuario no autorizado o sin tokens de Google" });
            return
        }

        oAuth2Client.setCredentials({
            access_token: user?.google?.accessToken,
            refresh_token: user?.google?.refreshToken,
        });

        const threads = response.data.threads || [];
        console.log("threads", threads);


        const emails = await Promise.all(threads.map(async (thread: any) => {
            return await getFullMessage(req.params.email, thread.id, token);
        }));

        console.log("emails :", emails);

        const fullMessagesNoVacios = emails
            .filter(mensaje => mensaje)
            .map(mensaje => {
                if (mensaje.fullMessage && mensaje.fullMessage.trim() !== "") {
                    return mensaje.fullMessage;
                } else if (mensaje.snippet) {
                    return mensaje.snippet;
                }
                return "";
            })
            .filter(texto => texto.trim() !== "");

        // const maxTokens = 200;
        const truncatedText = fullMessagesNoVacios.map(e =>
            e.split(/\s+/).join(" ")
        );
        console.log("truncatedText: ", truncatedText);

        const translatedTextArray: string[] = [];

        for (const text of truncatedText) {
            if (verifyLenguage(text)) {
                translatedTextArray.push(text); // no traducir
                continue;
            }

            try {
                const translationResponse = await axios.post(
                    "http://localhost:5000/translate",
                    {
                        q: text,
                        source: "es",
                        target: "en",
                        format: "text"
                    },
                    {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );

                const translated = translationResponse.data.translatedText;

                let cleanTranslated = translated
                    .replace(/Translated text\s*/gi, "")
                    .replace(/https:\s*\/\s*\//gi, "https://")
                    .replace(/\s*\/\s*/g, "/")
                    .replace(/\. ([A-Z])/g, ".\n$1");

                translatedTextArray.push(cleanTranslated);

                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error: any) {
                console.error("Error al traducir:", error.response?.data || error.message);
            }
        }


        const emailClassify = await classifyEmails(translatedTextArray)



        const correosRelevantes = xdd(emailClassify, 0.95);
        console.log("📨 Correos relevantes listos para Google Calendar: ", correosRelevantes);

        const r = await createGoogleEvents({
            oAuth2Client,
            userId: user._id.toString(),
            correosRelevantes
        });
        console.log("RR: ", r);

        res.status(200).json({
            message: 'Correos analizados y eventos creados correctamente',
            correosRelevantes
        });
        // res.status(200).json({ message: 'Correos analizados y eventos creados correctamente' });
        // res.json(correosRelevantes)

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching emails" });
    }
}

async function readMail(req: Request, res: Response) {
    try {
        const hf = new HfInference(process.env.HF_TOKEN)

        const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/messages/${req.params.messageId}`;
        const { token } = await oAuth2Client.getAccessToken();
        const config = createConfig(url, token);
        const response = await axios(config);

        let data = await response.data.payload.parts[0].body.data;
        const decodedText = decodeBase64(data);

        const translatedText = await hf.translation({
            model: 'facebook/mbart-large-50-many-to-many-mmt',
            inputs: decodedText,
            parameters: {
                "src_lang": "es_XX",
                "tgt_lang": "en_XX"
            }
        })

        const result = await extractDates(translatedText.translation_text)
        //   console.log(result)


        res.json(result);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
}

export default { getMails, readMail }
