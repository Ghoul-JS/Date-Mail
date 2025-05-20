import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from 'cookie-parser';

import userRoutes from "./routes/userRoutes"
import eventRoutes from "./routes/eventRoutes"
import gmailApiRoutes from "./routes/gmailApiRoutes"
import googleRoutes from "./routes/googleRoutes"
import dataAuthRotes from "./routes/dataAuth.routes"
const app = express();

//Middlewares
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true })); 
app.use(morgan("dev"));
app.use(cookieParser());
  
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true,
  }));

//routes
app.use("/api/v1", userRoutes)
app.use("/api/v1", eventRoutes)
app.use("/api/v1", gmailApiRoutes)
app.use("/api/v1", googleRoutes)
app.use("/api/v1", dataAuthRotes)

export default app;