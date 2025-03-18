import express from "express";
import morgan from "morgan";
import cors from "cors";

import userRoutes from "../src/routes/userRoutes"
import eventRoutes from "../src/routes/eventRoutes"
import gmailApiRoutes from "../src/routes/gmailApiRoutes"

const app = express();

//Middlewares
app.use(express.json({ limit: "50mb" })); // Aumenta el límite de tamaño para el JSON
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Aumenta el límite de tamaño para datos URL-encoded
app.use(morgan("dev"));
app.use(cors());


//routes
app.use("/api/v1", userRoutes)
app.use("/api/v1", eventRoutes)
app.use("/api/v1", gmailApiRoutes)

export default app;