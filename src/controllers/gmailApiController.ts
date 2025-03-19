import axios from "axios"
import createConfig from "../utils"
import { google } from "googleapis";
import { Request, Response } from "express";

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
);

oAuth2Client.setCredentials({
    access_token: process.env.ACCESS_TOKEN, 
    refresh_token: process.env.REFRESH_TOKEN 
});

async function getMails(req:Request, res:Response) {
    try{
        const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/threads?maxResults=100`;
      
        const { token } = await oAuth2Client.getAccessToken();

        const config = createConfig(url, token);
        const response = await axios(config);
        res.json(response.data);
    }
    catch(error){
        console.log(error);
        res.send(error);
    }
}

async function readMail(req:Request, res:Response) {
    try{
        const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/messages/${req.params.messageId}`;
        const { token } = await oAuth2Client.getAccessToken();
        const config = createConfig(url, token);
        const response = await axios(config);
        
        let data = await response.data;
        res.json(data);
    }
    catch(error){
        console.log(error);
        res.send(error);
    }
}

export default {getMails, readMail}
