import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import { router } from "./api";
dotenv.config();
const server = express();
const port = process.env.PORT || 3000;

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(morgan("combined"));
server.use(express.static("public"));
server.use("/api", router);

server.listen(port, () => {
    console.log("Server listening on http://127.0.0.1:3000");
});