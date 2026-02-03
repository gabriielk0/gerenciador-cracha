const express = require('express');
const {createCanvas, loadImage} = require('canvas');

const app = express();
app.use(express.json());

app.post("/gerar-cracha", async (req, res) => {
    // const { nome, equipe } = req.body;
    const nome = "Tio João Paulo";
    const equipe = "Admin";

    const template = await loadImage("templates/modelo.png");
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(template, 0, 0);

    ctx.fillStyle = "#000";
    ctx.font = "60px Arial";
    ctx.fillText(nome, 470, 420);

    ctx. font = "40px Arial";
    ctx.fillText(equipe, 470, 470);

    const buffer = canvas.toBuffer("image/png");

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});