const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Берем токен из настроек Render, которые вы заполнили выше
const BOT_TOKEN = process.env.TELEGRAM_TOKEN;

app.get('/send', async (req, res) => {
    const { chatId, text } = req.query;
    
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        await axios.get(url, {
            params: { chat_id: chatId, text: text }
        });
        res.send({ status: 'ok' });
    } catch (error) {
        res.status(500).send({ status: 'error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is live!`));
