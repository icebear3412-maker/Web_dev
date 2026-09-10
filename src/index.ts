import express from "express";

const app = express();

app.use(express.json());

app.get("", (_req, res) => {
    res.json({
        message: "Hello from Express!",
    });
});

app.listen(3000, () => {
    console.log("Backend running at http://localhost:3000");
});