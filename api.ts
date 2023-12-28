import express from "express";
import { JsonDB, Config as JsonDBConfig } from "node-json-db";
import dotenv from "dotenv";
dotenv.config();
const pingInterval = process.env.PING_INTERVAL ? parseInt(process.env.PING_INTERVAL) : 2;
const router = express.Router();
const db = new JsonDB(new JsonDBConfig("db", true, false, "/"));
let lastPing = {};

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.get("/ping", (req, res) => {
    const date = req.query.date ? parseInt(req.query.date as string) : null;
    res.json({
        message: "pong",
        date: new Date().getTime(),
        requestDate: date,
        ping: date ? new Date().getTime() - new Date(date).getTime() : null
    });
});
router.get("/ping/last", (req, res) => {
    res.json(lastPing);
});
router.get("/ping/all", async (req, res) => {
    const amount = req.query.amount ? parseInt(req.query.amount as string) : 30;
    res.json((await db.getData("/ping")).slice(-amount));
});

setInterval(() => {
    fetch(process.env.PING_URL as string + "?" + new URLSearchParams({
        "date": new Date().getTime().toString(),
    }))
        .then(res => res.json())
        .then(data => {
            lastPing = {
                status: "ok",
                date: new Date().getTime(),
                data
            };
            db.push("/ping[]", lastPing);
            console.log(lastPing);
        })
        .catch(err => {
            lastPing = {
                status: "error",
                date: new Date().getTime(),
                data: err
            };
            db.push("/ping[]", lastPing);
            console.error(lastPing);
        });
}, 1000 * pingInterval);

export { router };